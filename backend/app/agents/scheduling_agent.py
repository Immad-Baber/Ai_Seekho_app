from typing import Any

from app.agents.base import BaseAgent
from app.engines.scheduling_engine import scheduling_engine


class SchedulingAgent(BaseAgent):
    name = "Scheduling Agent"

    async def run(self, context: dict[str, Any]) -> dict[str, Any]:
        intent = context["intent"]
        matches = context.get("matches", [])
        force_conflict = context.get("edge_case") == "schedule_conflict"

        if not matches:
            context["schedule"] = None
            context.setdefault("traces", []).append(
                self.trace("skip", "No provider — scheduling skipped")
            )
            return context

        provider = matches[0]
        slot = scheduling_engine.assign_slot(intent, provider, force_conflict=force_conflict)

        msg = f"Slot {slot.start.strftime('%I:%M %p')} assigned"
        if slot.conflict_detected:
            msg = f"10AM conflict detected — {slot.start.strftime('%I:%M %p')} assigned (alternate)"

        context["schedule"] = slot
        context.setdefault("traces", []).append(
            self.trace(
                "assign_slot",
                msg,
                confidence=0.89,
                details={
                    "start": slot.start.isoformat(),
                    "buffer_minutes": slot.buffer_minutes,
                    "alternates": slot.alternate_slots,
                },
            )
        )
        return context
