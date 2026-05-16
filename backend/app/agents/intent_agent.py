from typing import Any

from app.agents.base import BaseAgent
from app.models.schemas import Complexity, ParsedIntent, Urgency
from app.services.gemini_client import gemini


class IntentUnderstandingAgent(BaseAgent):
    name = "Intent Understanding Agent"

    async def run(self, context: dict[str, Any]) -> dict[str, Any]:
        message = context.get("normalized_message") or context["message"]
        traces = []

        parsed = await gemini.generate_json(
            f'Extract service intent from: "{message}"',
            system="Return JSON: service_type, urgency, location_text, time_preference, "
            "budget_sensitivity, complexity, confidence (0-1), clarification_questions (array)",
        )
        if not parsed:
            parsed = gemini.rule_based_intent(message)
            traces.append(
                self.trace(
                    "fallback",
                    "Gemini unavailable — rule-based intent parser engaged",
                    confidence=parsed.get("confidence", 0.5),
                )
            )

        confidence = float(parsed.get("confidence", 0.5))
        clarification = []
        needs_clarification = confidence < 0.7

        if needs_clarification:
            clarification = parsed.get("clarification_questions") or [
                "Kaun si service chahiye? (AC, plumber, electrician?)",
                "Apna area batayein (e.g. G-13, DHA)?",
                "Kab chahiye — aaj, kal, ya flexible?",
            ]

        intent = ParsedIntent(
            raw_message=message,
            detected_language=context.get("detected_language", "mixed"),
            service_type=parsed.get("service_type"),
            service_category=parsed.get("service_type"),
            urgency=Urgency(parsed.get("urgency", "medium")),
            location_text=parsed.get("location_text"),
            time_preference=parsed.get("time_preference"),
            budget_sensitivity=parsed.get("budget_sensitivity", "medium"),
            issue_severity=parsed.get("issue_severity", "medium"),
            complexity=Complexity(parsed.get("complexity", "basic")),
            confidence=confidence,
            needs_clarification=needs_clarification,
            clarification_questions=clarification,
        )

        traces.append(
            self.trace(
                "extract_intent",
                f"Service: {intent.service_type}, Urgency: {intent.urgency.value}, "
                f"Location: {intent.location_text or 'unknown'}",
                confidence=confidence,
                details=intent.model_dump(),
            )
        )

        context["intent"] = intent
        context.setdefault("traces", []).extend(traces)
        return context
