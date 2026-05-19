"""14-factor provider matching engine."""

from datetime import datetime, timedelta
from typing import Any, Optional

from app.config.matching_weights import MATCHING_WEIGHTS
from app.models.schemas import FactorScore, ParsedIntent, ProviderMatch
from app.services.data_store import store
from app.services.maps_service import maps_service, resolve_coords


def _norm(val: float, lo: float = 0, hi: float = 1) -> float:
    if hi == lo:
        return 0.5
    return max(0, min(1, (val - lo) / (hi - lo)))


class MatchingEngine:
    async def rank_providers(
        self,
        intent: ParsedIntent,
        user_id: str,
        exclude_ids: Optional[list[str]] = None,
        max_results: int = 5,
    ) -> tuple[list[ProviderMatch], list[ProviderMatch]]:
        user = store.get_user_by_id(user_id) or {}
        user_prefs = set(user.get("preferences", []))
        user_loc = resolve_coords(intent.location_text)
        service = (intent.service_type or "").lower()
        exclude = set(exclude_ids or [])

        providers = store.get_providers()
        candidates = [
            p
            for p in providers
            if p.get("active", True)
            and p["id"] not in exclude
            and (not service or service in [s.lower() for s in p.get("specializations", [])])
        ]

        if not candidates:
            candidates = [p for p in providers if p.get("active", True) and p["id"] not in exclude]

        matches: list[ProviderMatch] = []
        rejected: list[ProviderMatch] = []

        for p in candidates:
            prov_loc = (p["lat"], p["lng"])
            km, eta, fallback = await maps_service.distance_km(user_loc, prov_loc)
            factors: list[FactorScore] = []
            rejection_reasons: list[str] = []

            # 1. Distance
            dist_score = _norm(1 - min(km / 15, 1))
            factors.append(
                FactorScore(
                    factor="distance",
                    score=dist_score,
                    weight=MATCHING_WEIGHTS["distance"],
                    weighted=dist_score * MATCHING_WEIGHTS["distance"],
                    note=f"{km:.1f} km, ETA {eta} min" + (" (cached)" if fallback else ""),
                )
            )

            # 2. Availability
            avail = 1.0 if p.get("available_now") else 0.4
            factors.append(
                FactorScore(
                    factor="availability",
                    score=avail,
                    weight=MATCHING_WEIGHTS["availability"],
                    weighted=avail * MATCHING_WEIGHTS["availability"],
                )
            )

            metrics = p.get("metrics", {})
            # 3. Reliability
            rel = metrics.get("reliability_score", 0.7)
            factors.append(
                FactorScore(
                    factor="reliability",
                    score=rel,
                    weight=MATCHING_WEIGHTS["reliability"],
                    weighted=rel * MATCHING_WEIGHTS["reliability"],
                )
            )

            # 4. Rating
            rating = metrics.get("rating", 4.0) / 5.0
            factors.append(
                FactorScore(
                    factor="rating",
                    score=rating,
                    weight=MATCHING_WEIGHTS["rating"],
                    weighted=rating * MATCHING_WEIGHTS["rating"],
                )
            )

            # 5. Review recency
            days = metrics.get("days_since_last_review", 30)
            recency = _norm(1 - min(days / 90, 1))
            factors.append(
                FactorScore(
                    factor="review_recency",
                    score=recency,
                    weight=MATCHING_WEIGHTS["review_recency"],
                    weighted=recency * MATCHING_WEIGHTS["review_recency"],
                )
            )

            # 6. Specialization
            specs = [s.lower() for s in p.get("specializations", [])]
            spec_score = 1.0 if service and service in specs else 0.5
            factors.append(
                FactorScore(
                    factor="specialization",
                    score=spec_score,
                    weight=MATCHING_WEIGHTS["specialization"],
                    weighted=spec_score * MATCHING_WEIGHTS["specialization"],
                )
            )

            # 7. Price compatibility
            rate = p.get("hourly_rate", 1500)
            budget_map = {"high": 1200, "medium": 2000, "low": 3000}
            max_rate = budget_map.get(intent.budget_sensitivity, 2500)
            price_score = 1.0 if rate <= max_rate else _norm(max_rate / rate, 0.3, 1)
            if rate > max_rate * 1.5:
                rejection_reasons.append(f"Rate PKR {rate} exceeds budget sensitivity")
            factors.append(
                FactorScore(
                    factor="price_compatibility",
                    score=price_score,
                    weight=MATCHING_WEIGHTS["price_compatibility"],
                    weighted=price_score * MATCHING_WEIGHTS["price_compatibility"],
                )
            )

            # 8. Cancellation history
            cancel_rate = metrics.get("cancellation_rate", 0.1)
            cancel_score = 1 - min(cancel_rate, 0.5) * 2
            if cancel_rate > 0.25:
                rejection_reasons.append("high cancellation rate")
            factors.append(
                FactorScore(
                    factor="cancellation_history",
                    score=cancel_score,
                    weight=MATCHING_WEIGHTS["cancellation_history"],
                    weighted=cancel_score * MATCHING_WEIGHTS["cancellation_history"],
                )
            )

            # 9. Workload
            workload = metrics.get("current_jobs", 0) / max(p.get("max_daily_jobs", 5), 1)
            workload_score = 1 - min(workload, 1)
            factors.append(
                FactorScore(
                    factor="workload",
                    score=workload_score,
                    weight=MATCHING_WEIGHTS["workload"],
                    weighted=workload_score * MATCHING_WEIGHTS["workload"],
                )
            )

            # 10. User preferences
            prov_tags = set(p.get("tags", []))
            pref_overlap = len(user_prefs & prov_tags) / max(len(user_prefs), 1) if user_prefs else 0.5
            factors.append(
                FactorScore(
                    factor="user_preferences",
                    score=pref_overlap if user_prefs else 0.5,
                    weight=MATCHING_WEIGHTS["user_preferences"],
                    weighted=(pref_overlap if user_prefs else 0.5) * MATCHING_WEIGHTS["user_preferences"],
                )
            )

            # 11. On-time score
            on_time = metrics.get("on_time_score", 0.8)
            factors.append(
                FactorScore(
                    factor="on_time_score",
                    score=on_time,
                    weight=MATCHING_WEIGHTS["on_time_score"],
                    weighted=on_time * MATCHING_WEIGHTS["on_time_score"],
                )
            )

            # 12. Risk score (provider)
            prov_risk = metrics.get("risk_score", 0.15)
            risk_factor = 1 - prov_risk
            if prov_risk > 0.6:
                rejection_reasons.append("elevated provider risk score")
            factors.append(
                FactorScore(
                    factor="risk_score",
                    score=risk_factor,
                    weight=MATCHING_WEIGHTS["risk_score"],
                    weighted=risk_factor * MATCHING_WEIGHTS["risk_score"],
                )
            )

            # 13. Complexity fit
            exp = p.get("experience_years", 1)
            complexity_req = {"basic": 1, "intermediate": 3, "complex": 5}
            needed = complexity_req.get(intent.complexity.value, 1)
            complexity_score = _norm(exp, 0, 10) if exp >= needed else exp / needed * 0.6
            factors.append(
                FactorScore(
                    factor="complexity_fit",
                    score=complexity_score,
                    weight=MATCHING_WEIGHTS["complexity_fit"],
                    weighted=complexity_score * MATCHING_WEIGHTS["complexity_fit"],
                )
            )

            # 14. Completion history
            completion = metrics.get("completion_rate", 0.9)
            factors.append(
                FactorScore(
                    factor="completion_history",
                    score=completion,
                    weight=MATCHING_WEIGHTS["completion_history"],
                    weighted=completion * MATCHING_WEIGHTS["completion_history"],
                )
            )

            total = sum(f.weighted for f in factors)
            match = ProviderMatch(
                provider_id=p["id"],
                name=p["name"],
                total_score=round(total, 4),
                factor_scores=factors,
                rejection_reasons=rejection_reasons,
                distance_km=round(km, 2),
                eta_minutes=eta,
                hourly_rate=rate,
                specialization=p.get("specializations", []),
                lat=p.get("lat"),
                lng=p.get("lng"),
            )

            if rejection_reasons and total < 0.55:
                rejected.append(match)
            else:
                matches.append(match)

        matches.sort(key=lambda m: m.total_score, reverse=True)
        rejected.sort(key=lambda m: m.total_score, reverse=True)

        for i, m in enumerate(matches[:max_results]):
            m.selected = i == 0

        return matches[:max_results], rejected[:3]


matching_engine = MatchingEngine()
