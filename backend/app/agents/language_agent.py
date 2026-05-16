from typing import Any

from app.agents.base import BaseAgent
from app.services.gemini_client import gemini


class LanguageParsingAgent(BaseAgent):
    name = "Language Parsing Agent"

    async def run(self, context: dict[str, Any]) -> dict[str, Any]:
        message = context["message"]
        lang = gemini.detect_language(message)
        normalized = message.strip()

        traces = [
            self.trace(
                "detect_language",
                f"Language: {lang.replace('_', ' ').title()}",
                confidence=0.92,
                details={"raw_length": len(message)},
            )
        ]

        if lang in ("roman_urdu", "mixed", "urdu"):
            traces.append(
                self.trace(
                    "normalize",
                    "Code-switching detected — routing to multilingual intent pipeline",
                    details={"script": "latin" if lang != "urdu" else "arabic"},
                )
            )

        context["detected_language"] = lang
        context["normalized_message"] = normalized
        context.setdefault("traces", []).extend(traces)
        return context
