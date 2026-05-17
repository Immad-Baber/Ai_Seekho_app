from typing import Any

from app.agents.base import BaseAgent


class NotificationAgent(BaseAgent):
    name = "Notification Agent"

    async def run(self, context: dict[str, Any]) -> dict[str, Any]:
        booking_id = context.get("booking_id")
        channels = []
        traces = []

        if booking_id:
            channels = ["FCM push", "WhatsApp template (simulated)", "SMS reminder scheduled"]
            
            # 1. Immediate confirmation
            traces.append(
                self.trace(
                    "notify_confirmation",
                    f"Booking confirmation sent for {booking_id} via FCM push",
                    details={"channels": ["FCM push"], "type": "immediate"},
                )
            )

            # 2. Schedule reminders
            traces.append(
                self.trace(
                    "schedule_reminders",
                    f"Follow-up reminders scheduled for {booking_id}",
                    details={"reminder_times": ["-1h", "en_route", "arrived"]},
                )
            )

            # 3. Schedule completion flow
            traces.append(
                self.trace(
                    "schedule_completion",
                    f"Post-service feedback prompt scheduled for {booking_id}",
                    details={"trigger": "status == completed"},
                )
            )

            context.setdefault("traces", []).extend(traces)
        return context
