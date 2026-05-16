from typing import Any

from app.agents.base import BaseAgent


class NotificationAgent(BaseAgent):
    name = "Notification Agent"

    async def run(self, context: dict[str, Any]) -> dict[str, Any]:
        booking_id = context.get("booking_id")
        channels = []

        if booking_id:
            channels = ["FCM push", "WhatsApp template (simulated)", "SMS reminder scheduled"]
            context.setdefault("traces", []).append(
                self.trace(
                    "notify",
                    f"Reminders queued for {booking_id}: " + ", ".join(channels),
                    details={"channels": channels, "reminder_times": ["-24h", "-1h", "en_route"]},
                )
            )
        return context
