from datetime import datetime

from app.models.schemas import Complexity, ParsedIntent, PricingBreakdown, PricingLineItem, ProviderMatch, Urgency


class PricingEngine:
  def calculate(
      self,
      intent: ParsedIntent,
      provider: ProviderMatch | None,
      demand_factor: float = 1.0,
      loyalty_discount_pct: float = 0,
  ) -> PricingBreakdown:
    base_rates = {
        "ac": 2500,
        "electrician": 1800,
        "plumber": 2000,
        "beautician": 3000,
        "tutor": 1500,
        "mechanic": 2200,
        "driver": 1200,
        "cleaning": 1600,
        "appliance": 2300,
        "home_repair": 1900,
        "general": 2000,
    }
    svc = (intent.service_type or "general").lower()
    base = base_rates.get(svc, 2000)
    if provider:
      base = (base + provider.hourly_rate) / 2

    line_items: list[PricingLineItem] = [
        PricingLineItem(label="Base service fee", amount=base, description=svc)
    ]

    urgency_mult = {
        Urgency.low: 0.95,
        Urgency.medium: 1.0,
        Urgency.high: 1.12,
        Urgency.emergency: 1.25,
    }[intent.urgency]
    if urgency_mult != 1.0:
      uplift = base * (urgency_mult - 1)
      line_items.append(
          PricingLineItem(
              label="Urgency multiplier",
              amount=round(uplift, 0),
              multiplier=urgency_mult,
              description=f"+{int((urgency_mult-1)*100)}%",
          )
      )

    complexity_mult = {
        Complexity.basic: 1.0,
        Complexity.intermediate: 1.15,
        Complexity.complex: 1.35,
    }[intent.complexity]
    if complexity_mult > 1:
      c_amt = base * (complexity_mult - 1)
      line_items.append(
          PricingLineItem(
              label="Complexity adjustment",
              amount=round(c_amt, 0),
              multiplier=complexity_mult,
          )
      )

    dist = provider.distance_km if provider and provider.distance_km else 3
    travel = min(dist * 80, 600)
    line_items.append(
        PricingLineItem(label="Travel / distance", amount=round(travel, 0), description=f"{dist:.1f} km")
    )

    surge = demand_factor > 1.15
    if surge:
      surge_amt = base * 0.12
      line_items.append(
          PricingLineItem(label="Peak demand surge", amount=round(surge_amt, 0), multiplier=1.12)
      )

    risk = 0
    if intent.issue_severity == "high":
      risk = base * 0.05
      line_items.append(PricingLineItem(label="Risk buffer", amount=round(risk, 0)))

    subtotal = sum(i.amount for i in line_items)
    loyalty = subtotal * (loyalty_discount_pct / 100)
    if loyalty > 0:
      line_items.append(PricingLineItem(label="Loyalty discount", amount=-round(loyalty, 0)))

    total = subtotal - loyalty
    tax = 0

    return PricingBreakdown(
        base_price=base,
        line_items=line_items,
        subtotal=round(subtotal, 0),
        tax=tax,
        total=round(total + tax, 0),
        surge_applied=surge,
        loyalty_discount=loyalty,
    )


pricing_engine = PricingEngine()
