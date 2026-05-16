from typing import Any

from app.agents.base import BaseAgent


class ReputationAgent(BaseAgent):
    name = "Reputation Agent"

    async def run(self, context: dict[str, Any]) -> dict[str, Any]:
        match = context.get("selected_provider") or (
            context.get("matches", [None])[0] if context.get("matches") else None
        )
        if match:
            context.setdefault("traces", []).append(
                self.trace(
                    "snapshot",
                    f"Provider {match.name} trust score updated in analytics pipeline",
                    details={"provider_id": match.provider_id, "delta": 0},
                )
            )
        return context
