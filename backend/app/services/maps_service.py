"""Google Maps Distance Matrix with Haversine fallback."""

import math
from typing import Optional

import httpx

from app.config import get_settings

# Islamabad area reference coordinates for demo
AREA_COORDS = {
    "g-13": (33.6844, 73.0479),
    "g-10": (33.6702, 73.0223),
    "f-7": (33.7215, 73.0433),
    "dha": (33.5211, 73.1582),
    "bahria": (33.5386, 73.0942),
    "default": (33.6844, 73.0479),
}


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlon / 2) ** 2
    return r * 2 * math.asin(math.sqrt(a))


def resolve_coords(location_text: Optional[str]) -> tuple[float, float]:
    if not location_text:
        return AREA_COORDS["default"]
    key = location_text.lower().replace(" ", "").replace("-", "")[:10]
    for area, coords in AREA_COORDS.items():
        if area.replace("-", "") in key or key in area.replace("-", ""):
            return coords
    return AREA_COORDS["default"]


class MapsService:
    def __init__(self) -> None:
        self.settings = get_settings()

    async def distance_km(
        self, origin: tuple[float, float], dest: tuple[float, float]
    ) -> tuple[float, int, bool]:
        """Returns (km, eta_minutes, used_fallback)."""
        if self.settings.google_maps_api_key and not self.settings.use_mock_gcp:
            try:
                async with httpx.AsyncClient() as client:
                    url = "https://maps.googleapis.com/maps/api/distancematrix/json"
                    params = {
                        "origins": f"{origin[0]},{origin[1]}",
                        "destinations": f"{dest[0]},{dest[1]}",
                        "key": self.settings.google_maps_api_key,
                    }
                    r = await client.get(url, params=params, timeout=5.0)
                    data = r.json()
                    elem = data["rows"][0]["elements"][0]
                    if elem.get("status") == "OK":
                        km = elem["distance"]["value"] / 1000
                        eta = elem["duration"]["value"] // 60
                        return km, eta, False
            except Exception:
                pass

        km = haversine_km(origin[0], origin[1], dest[0], dest[1])
        eta = int(km * 3.5) + 10
        return km, eta, True


maps_service = MapsService()
