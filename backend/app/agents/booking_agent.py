import uuid
from datetime import datetime
from typing import Any

from app.agents.base import BaseAgent
from app.services.data_store import store


class BookingAgent(BaseAgent):
    name = "Booking Agent"

    async def run(self, context: dict[str, Any]) -> dict[str, Any]:
        if context.get("intent") and context["intent"].needs_clarification:
            context["booking_id"] = None
            context["status"] = "needs_clarification"
            context.setdefault("traces", []).append(
                self.trace("hold", "Booking held — awaiting user clarification")
            )
            return context

        matches = context.get("matches", [])
        if not matches and context.get("edge_case") != "no_provider":
            context["status"] = "failed"
            return context

        if context.get("edge_case") == "no_provider":
            context["booking_id"] = f"WL-{uuid.uuid4().hex[:8]}"
            context["status"] = "waitlisted"
            context.setdefault("traces", []).append(
                self.trace("waitlist", f"Added to waitlist {context['booking_id']}")
            )
            return context

        booking_id = f"BK-{uuid.uuid4().hex[:8].upper()}"
        match = matches[0]
        schedule = context.get("schedule")
        pricing = context.get("pricing")

        booking = {
            "id": booking_id,
            "user_id": context.get("user_id"),
            "provider_id": match.provider_id,
            "provider_name": match.name,
            "service_type": context["intent"].service_type,
            "status": "confirmed",
            "total_price": pricing.total if pricing else 0,
            "scheduled_start": schedule.start.isoformat() if schedule else None,
            "scheduled_end": schedule.end.isoformat() if schedule else None,
            "created_at": datetime.utcnow().isoformat(),
            "lifecycle": ["confirmed", "provider_assigned"],
        }
        store.append_booking(booking)

        context["booking_id"] = booking_id
        context["status"] = "confirmed"
        context["selected_provider"] = match
        context.setdefault("traces", []).append(
            self.trace(
                "create_booking",
                f"Booking {booking_id} confirmed with {match.name}",
                confidence=0.97,
                details={"booking_id": booking_id},
            )
        )
        return context
