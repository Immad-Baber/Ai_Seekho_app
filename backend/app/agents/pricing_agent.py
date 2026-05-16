from typing import Any

from app.agents.base import BaseAgent
from app.engines.pricing_engine import pricing_engine


class DynamicPricingAgent(BaseAgent):
    name = "Dynamic Pricing Agent"

    async def run(self, context: dict[str, Any]) -> dict[str, Any]:
        intent = context["intent"]
        matches = context.get("matches", [])
        provider = matches[0] if matches else None
        user = context.get("user", {})
        loyalty = user.get("loyalty_discount_pct", 0)
        demand = context.get("demand_factor", 1.08 if intent.urgency.value in ("high", "emergency") else 1.0)

        pricing = pricing_engine.calculate(intent, provider, demand, loyalty)

        urgency_note = ""
        for item in pricing.line_items:
            if "Urgency" in item.label:
                urgency_note = item.description or f"+{int((item.multiplier or 1)-1)*100}%"

        context["pricing"] = pricing
        context.setdefault("traces", []).append(
            self.trace(
                "calculate_price",
                f"Total PKR {pricing.total:,.0f} — urgency: {urgency_note or 'standard'}",
                confidence=0.94,
                details={"total": pricing.total, "surge": pricing.surge_applied},
            )
        )
        return context
