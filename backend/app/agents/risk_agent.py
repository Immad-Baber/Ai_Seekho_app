from typing import Any

from app.agents.base import BaseAgent


class RiskAssessmentAgent(BaseAgent):
    name = "Risk Assessment Agent"

    async def run(self, context: dict[str, Any]) -> dict[str, Any]:
        intent = context["intent"]
        risk_score = 0.2
        flags = []

        if intent.urgency.value == "emergency":
            risk_score += 0.15
            flags.append("emergency_job")

        if intent.complexity.value == "complex":
            risk_score += 0.2
            flags.append("high_complexity")

        if intent.confidence < 0.5:
            risk_score += 0.25
            flags.append("low_parse_confidence")

        high_risk_services = {"electrician", "gas", "welding"}
        if intent.service_type in high_risk_services:
            risk_score += 0.1
            flags.append("safety_sensitive_service")

        context["risk_score"] = min(risk_score, 1.0)
        context["risk_flags"] = flags
        context.setdefault("traces", []).append(
            self.trace(
                "assess_risk",
                f"Risk score: {risk_score:.0%} — flags: {', '.join(flags) or 'none'}",
                confidence=0.88,
                details={"risk_score": risk_score, "flags": flags},
            )
        )
        return context
