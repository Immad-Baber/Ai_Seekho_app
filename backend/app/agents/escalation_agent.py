from typing import Any

from app.agents.base import BaseAgent


class EscalationAgent(BaseAgent):
    name = "Escalation Agent"

    async def run(self, context: dict[str, Any]) -> dict[str, Any]:
        intent = context.get("intent")
        risk = context.get("risk_score", 0)
        escalated = False
        reasons = []

        if intent and intent.needs_clarification:
            reasons.append("low_confidence_intent")
        if risk > 0.7:
            reasons.append("high_risk_job")
            escalated = True
        if context.get("edge_case") == "no_provider":
            reasons.append("capacity_shortage")
            escalated = True

        if escalated:
            context.setdefault("traces", []).append(
                self.trace(
                    "escalate",
                    f"Ops escalation: {', '.join(reasons)}",
                    details={"reasons": reasons},
                )
            )
        context["escalated"] = escalated
        return context
