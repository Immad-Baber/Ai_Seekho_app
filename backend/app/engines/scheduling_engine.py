from datetime import datetime, timedelta
from typing import Any, Optional

from app.models.schemas import ParsedIntent, ProviderMatch, ScheduleSlot
from app.services.data_store import store


class SchedulingEngine:
    def __init__(self) -> None:
        self._booked_slots: dict[str, list[tuple[datetime, datetime]]] = {}

    def _load_existing(self, provider_id: str) -> list[tuple[datetime, datetime]]:
        slots = self._booked_slots.get(provider_id, [])
        for b in store.get_bookings():
            if b.get("provider_id") == provider_id and b.get("status") not in (
                "cancelled",
                "completed",
            ):
                try:
                    start = datetime.fromisoformat(b["scheduled_start"].replace("Z", ""))
                    end = datetime.fromisoformat(b["scheduled_end"].replace("Z", ""))
                    slots.append((start, end))
                except (KeyError, ValueError):
                    pass
        return slots

    def assign_slot(
        self,
        intent: ParsedIntent,
        provider: ProviderMatch,
        force_conflict: bool = False,
    ) -> ScheduleSlot:
        now = datetime.utcnow()
        if intent.time_preference and "tomorrow" in (intent.time_preference or "").lower():
            base = now + timedelta(days=1)
        else:
            base = now + timedelta(hours=2)

        if intent.time_preference and "morning" in intent.time_preference.lower():
            start = base.replace(hour=10, minute=0, second=0, microsecond=0)
        elif intent.time_preference and "evening" in intent.time_preference.lower():
            start = base.replace(hour=17, minute=0, second=0, microsecond=0)
        else:
            start = base.replace(minute=0, second=0, microsecond=0)

        buffer = 30 + (provider.eta_minutes or 20)
        duration = timedelta(hours=2)
        end = start + duration
        travel_buffer = timedelta(minutes=buffer)

        existing = self._load_existing(provider.provider_id)
        conflict = force_conflict
        alternates: list[dict[str, Any]] = []

        for booked_start, booked_end in existing:
            if start < booked_end and end > booked_start:
                conflict = True
                break

        if conflict:
            alt_start = start + timedelta(hours=1, minutes=30)
            alternates.append(
                {"start": alt_start.isoformat(), "end": (alt_start + duration).isoformat()}
            )
            alternates.append(
                {
                    "start": (start + timedelta(hours=3)).isoformat(),
                    "end": (start + timedelta(hours=5)).isoformat(),
                }
            )
            start = alt_start
            end = start + duration

        return ScheduleSlot(
            start=start,
            end=end,
            provider_id=provider.provider_id,
            buffer_minutes=buffer,
            conflict_detected=conflict,
            alternate_slots=alternates,
        )


scheduling_engine = SchedulingEngine()
