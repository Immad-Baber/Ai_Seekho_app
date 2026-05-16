"""Data access — Firestore in production, JSON files in demo mode."""

import json
from pathlib import Path
from typing import Any, Optional

from app.config import get_settings


class DataStore:
    def __init__(self) -> None:
        self.settings = get_settings()
        root = Path(__file__).resolve().parents[3]
        self.data_dir = root / "data" / "demo"
        self._cache: dict[str, Any] = {}

    def _load(self, name: str) -> Any:
        if name in self._cache:
            return self._cache[name]
        path = self.data_dir / f"{name}.json"
        if not path.exists():
            return []
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        self._cache[name] = data
        return data

    def get_providers(self) -> list[dict]:
        return self._load("providers")

    def get_users(self) -> list[dict]:
        return self._load("users")

    def get_bookings(self) -> list[dict]:
        return self._load("bookings")

    def get_categories(self) -> list[dict]:
        return self._load("service_categories")

    def get_provider_by_id(self, provider_id: str) -> Optional[dict]:
        for p in self.get_providers():
            if p["id"] == provider_id:
                return p
        return None

    def get_user_by_id(self, user_id: str) -> Optional[dict]:
        for u in self.get_users():
            if u["id"] == user_id:
                return u
        return None

    def append_booking(self, booking: dict) -> None:
        bookings = self.get_bookings()
        if isinstance(bookings, list):
            bookings.append(booking)
        path = self.data_dir / "bookings.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(bookings, f, indent=2, default=str)

    def append_trace(self, trace: dict) -> None:
        path = self.data_dir / "ai_traces.json"
        traces: list = []
        if path.exists():
            with open(path, encoding="utf-8") as f:
                traces = json.load(f)
        traces.append(trace)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(traces[-500:], f, indent=2, default=str)


store = DataStore()
