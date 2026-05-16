from typing import Any

from app.agents.base import BaseAgent
from app.engines.matching_engine import matching_engine


class ProviderMatchingAgent(BaseAgent):
    name = "Provider Matching Agent"

    async def run(self, context: dict[str, Any]) -> dict[str, Any]:
        intent = context["intent"]
        user_id = context.get("user_id", "demo-user")
        exclude = context.get("exclude_provider_ids", [])
        edge = context.get("edge_case")

        if edge == "no_provider":
            context["matches"] = []
            context["rejected_matches"] = []
            context.setdefault("traces", []).append(
                self.trace(
                    "no_providers",
                    "No providers available in radius — waitlist recommended",
                    details={"action": "waitlist"},
                )
            )
            return context

        matches, rejected = await matching_engine.rank_providers(
            intent, user_id, exclude_ids=exclude
        )

        traces = []
        for r in rejected[:2]:
            reasons = "; ".join(r.rejection_reasons) or "low composite score"
            traces.append(
                self.trace(
                    "reject",
                    f"Provider {r.name} rejected: {reasons}",
                    details={"provider_id": r.provider_id, "score": r.total_score},
                )
            )

        if matches:
            top = matches[0]
            traces.append(
                self.trace(
                    "select",
                    f"Provider {top.name} selected: "
                    f"score {top.total_score:.0%}, "
                    f"{top.specialization[0] if top.specialization else 'general'} specialization, "
                    f"ETA {top.eta_minutes} min",
                    confidence=0.91,
                    details={"provider_id": top.provider_id},
                )
            )
        else:
            traces.append(
                self.trace("no_match", "No suitable providers after filtering", confidence=0.3)
            )

        context["matches"] = matches
        context["rejected_matches"] = rejected
        context.setdefault("traces", []).extend(traces)
        return context
