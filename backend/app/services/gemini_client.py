"""Gemini / Vertex AI client with rule-based fallback."""

import json
import re
from typing import Any, Optional

from app.config import get_settings

SERVICE_KEYWORDS = {
    "ac": ["ac", "air condition", "cooling", "split", "gas refill"],
    "electrician": ["electric", "wiring", "breaker", "light", "bijli"],
    "plumber": ["plumb", "pipe", "leak", "geyser", "pani", "drain", "tap"],
    "beautician": ["beauty", "facial", "hair", "makeup", "salon"],
    "tutor": ["tutor", "study", "math", "english", "coaching"],
    "mechanic": ["car", "bike", "engine", "mechanic", "garage"],
    "driver": ["driver", "chauffeur", "ride", "pick"],
    "cleaning": ["clean", "safai", "maid", "dust"],
    "appliance": ["washing", "machine", "fridge", "microwave", "repair"],
    "home_repair": ["door", "lock", "paint", "furniture", "carpenter"],
}

URGENCY_KEYWORDS = {
    "emergency": ["urgent", "emergency", "abhi", "foran", "asap", "jaldi"],
    "high": ["today", "aaj", "kal morning", "soon"],
    "low": ["cheap", "budget", "whenever", "flexible"],
}


class GeminiClient:
    def __init__(self) -> None:
        self.settings = get_settings()
        self._model = None
        if self.settings.gemini_api_key and not self.settings.use_mock_gcp:
            try:
                import google.generativeai as genai

                genai.configure(api_key=self.settings.gemini_api_key)
                self._model = genai.GenerativeModel(self.settings.gemini_model)
            except Exception:
                self._model = None

    async def generate_json(self, prompt: str, system: str = "") -> Optional[dict]:
        if self._model:
            try:
                full = f"{system}\n\n{prompt}\n\nRespond with valid JSON only."
                response = self._model.generate_content(full)
                text = response.text.strip()
                text = re.sub(r"^```json\s*", "", text)
                text = re.sub(r"\s*```$", "", text)
                return json.loads(text)
            except Exception:
                pass
        return None

    def detect_language(self, text: str) -> str:
        urdu_script = bool(re.search(r"[\u0600-\u06FF]", text))
        roman_urdu = bool(
            re.search(
                r"\b(mujhe|chahiye|kar|raha|hai|kal|subah|geyser|sasta|paas)\b",
                text,
                re.I,
            )
        )
        english = bool(re.search(r"\b(the|near|cheap|service|repair|need)\b", text, re.I))
        if urdu_script:
            return "urdu"
        if roman_urdu and english:
            return "mixed"
        if roman_urdu:
            return "roman_urdu"
        if english:
            return "english"
        return "mixed"

    def rule_based_intent(self, message: str) -> dict[str, Any]:
        lower = message.lower()
        service_type = "general"
        for svc, keywords in SERVICE_KEYWORDS.items():
            if any(k in lower for k in keywords):
                service_type = svc
                break

        urgency = "medium"
        for level, keywords in URGENCY_KEYWORDS.items():
            if any(k in lower for k in keywords):
                urgency = level if level != "high" else "high"
                if level == "emergency":
                    urgency = "emergency"
                break

        location = None
        loc_match = re.search(r"\b(G-\d+|Sector [A-Z]-\d+|DHA|Bahria|F-\d+)\b", message, re.I)
        if loc_match:
            location = loc_match.group(1)
        elif "near" in lower:
            parts = lower.split("near")
            if len(parts) > 1:
                location = parts[1].strip().split()[0:3]
                location = " ".join(location) if location else None

        time_pref = None
        if "kal" in lower or "tomorrow" in lower:
            time_pref = "tomorrow"
        if "morning" in lower or "subah" in lower:
            time_pref = (time_pref or "") + " morning"
        if "evening" in lower or "shaam" in lower:
            time_pref = (time_pref or "") + " evening"

        budget = "medium"
        if any(w in lower for w in ["cheap", "sasta", "kam", "budget"]):
            budget = "high"

        complexity = "basic"
        if any(w in lower for w in ["complex", "multiple", "replace", "install new"]):
            complexity = "complex"
        elif any(w in lower for w in ["leak", "not cooling", "wiring"]):
            complexity = "intermediate"

        confidence = 0.75
        if not service_type or service_type == "general":
            confidence = 0.45
        if self.detect_language(message) == "mixed":
            confidence = min(confidence + 0.1, 0.95)

        return {
            "detected_language": self.detect_language(message),
            "service_type": service_type,
            "urgency": urgency,
            "location_text": location,
            "time_preference": time_pref.strip() if time_pref else None,
            "budget_sensitivity": budget,
            "issue_severity": "high" if urgency == "emergency" else "medium",
            "complexity": complexity,
            "confidence": confidence,
        }


gemini = GeminiClient()
