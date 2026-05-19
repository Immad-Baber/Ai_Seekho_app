from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.agents.dispute_agent import DisputeResolutionAgent
from app.models.schemas import (
    DemoScenario,
    DisputeRequest,
    OrchestrationRequest,
)
from app.orchestrator.antigravity import orchestrator
from app.services.data_store import store

from app.config import get_settings

router = APIRouter(prefix="/api/v1")

@router.get("/config/maps-key")
async def get_maps_key():
    settings = get_settings()
    return {"google_maps_api_key": settings.google_maps_api_key}

# ── Static demo job pool for provider route page ──────────────────────────────
_DEMO_TODAY_JOBS = [
    {
        "id": "J1",
        "booking_id": "BK-001",
        "service": "AC Gas Refill",
        "service_type": "ac",
        "customer": "Ali Khan",
        "customer_phone": "03001234567",
        "area": "G-13",
        "location": "G-13/2, Islamabad",
        "time": "10:00 AM",
        "pay": 4500,
        "status": "completed",
        "eta_minutes": 0,
        "distance_km": 2.3,
        "lat": 33.6938,
        "lng": 73.0652,
    },
    {
        "id": "J2",
        "booking_id": "BK-002",
        "service": "Geyser Leak Repair",
        "service_type": "plumber",
        "customer": "Fatima Malik",
        "customer_phone": "03009876543",
        "area": "G-10",
        "location": "G-10/4, Islamabad",
        "time": "11:30 AM",
        "pay": 2800,
        "status": "in-progress",
        "eta_minutes": 12,
        "distance_km": 4.1,
        "lat": 33.7007,
        "lng": 73.0551,
    },
    {
        "id": "J3",
        "booking_id": "BK-003",
        "service": "Fan Wiring & Installation",
        "service_type": "electrician",
        "customer": "Ahmed Raza",
        "customer_phone": "03005551234",
        "area": "F-8",
        "location": "F-8/3, Islamabad",
        "time": "2:00 PM",
        "pay": 2600,
        "status": "auto-assigned",
        "eta_minutes": 28,
        "distance_km": 7.8,
        "lat": 33.7215,
        "lng": 73.0479,
    },
    {
        "id": "J4",
        "booking_id": "BK-004",
        "service": "Airport Drop",
        "service_type": "driver",
        "customer": "Sara Iqbal",
        "customer_phone": "03007778888",
        "area": "F-7",
        "location": "F-7/2, Islamabad",
        "time": "6:30 PM",
        "pay": 1800,
        "status": "auto-assigned",
        "eta_minutes": 35,
        "distance_km": 9.4,
        "lat": 33.7294,
        "lng": 73.0431,
    },
]


@router.post("/orchestrate")
async def orchestrate(request: OrchestrationRequest):
    """Main Antigravity orchestration endpoint."""
    return await orchestrator.orchestrate(request)


@router.get("/providers")
async def list_providers(service: Optional[str] = None):
    providers = store.get_providers()
    if service:
        providers = [
            p
            for p in providers
            if service.lower() in [s.lower() for s in p.get("specializations", [])]
        ]
    return {"providers": providers, "count": len(providers)}


@router.get("/providers/{provider_id}")
async def get_provider(provider_id: str):
    p = store.get_provider_by_id(provider_id)
    if not p:
        raise HTTPException(404, "Provider not found")
    return p


@router.get("/bookings")
async def list_bookings(user_id: Optional[str] = None):
    bookings = store.get_bookings()
    if user_id:
        bookings = [b for b in bookings if b.get("user_id") == user_id]
    return {"bookings": bookings}


@router.get("/bookings/{booking_id}")
async def get_booking(booking_id: str):
    for b in store.get_bookings():
        if b["id"] == booking_id:
            return b
    raise HTTPException(404, "Booking not found")


@router.post("/disputes")
async def create_dispute(req: DisputeRequest):
    agent = DisputeResolutionAgent()
    return await agent.run_dispute(req.booking_id, req.type, req.description)


@router.get("/traces")
async def list_traces(limit: int = Query(50, le=200)):
    from pathlib import Path
    import json

    path = Path(__file__).resolve().parents[2] / "data" / "demo" / "ai_traces.json"
    if not path.exists():
        return {"traces": []}
    with open(path, encoding="utf-8") as f:
        traces = json.load(f)
    return {"traces": traces[-limit:]}


@router.get("/categories")
async def categories():
    return {"categories": store.get_categories()}


@router.post("/demo/{scenario}")
async def run_demo(scenario: DemoScenario):
    demos = {
        DemoScenario.ac_repair: (
            "Mujhe kal morning AC service chahiye G-13 mein, gas refill bhi ho sakta hai",
            None,
        ),
        DemoScenario.plumber_urgent: (
            "Geyser leak ho raha hai, aaj G-13 mein plumber chahiye budget kam hai",
            None,
        ),
        DemoScenario.electrician_wiring: (
            "Sasta electrician chahiye F-8 mein fan aur wiring ke liye",
            None,
        ),
        DemoScenario.beautician_home: (
            "Home beautician chahiye kal shaam facial aur makeup ke liye Bahria mein",
            None,
        ),
        DemoScenario.tutor_math: (
            "Class 8 ke liye female math tutor chahiye I-8 mein weekly",
            None,
        ),
        DemoScenario.mechanic_car: (
            "Car engine check aur battery issue ke liye mechanic chahiye Saddar mein",
            None,
        ),
        DemoScenario.driver_airport: (
            "Kal subah airport drop ke liye reliable driver chahiye F-7 se",
            None,
        ),
        DemoScenario.cleaning_safai: (
            "Ghar ki safaii aur deep cleaning chahiye Sunday ko Bahria mein",
            None,
        ),
        DemoScenario.appliance_repair: (
            "Washing machine pani leak kar rahi hai G-11 mein repair chahiye",
            None,
        ),
        DemoScenario.home_repair: (
            "Door lock aur furniture repair ke liye mistri chahiye Gulberg mein",
            None,
        ),
        DemoScenario.ambiguous_input: (
            "machine theek nahi",
            None,
        ),
        DemoScenario.schedule_conflict: (
            "AC not cooling urgent G-10 today morning",
            "schedule_conflict",
        ),
        DemoScenario.no_provider: (
            "Rare antique clock repair near Skardu",
            "no_provider",
        ),
        DemoScenario.provider_cancel: (
            "Plumber geyser leak G-13 kal subah",
            "provider_cancel",
        ),
        DemoScenario.price_dispute: (
            "Electrician wiring F-7",
            "price_dispute",
        ),
    }
    message, edge = demos.get(scenario, ("AC repair G-13", None))
    req = OrchestrationRequest(message=message, user_id="demo-user-1")
    result = await orchestrator.orchestrate(req, edge_case=edge)

    if scenario == DemoScenario.price_dispute and result.booking_id:
        agent = DisputeResolutionAgent()
        dispute = await agent.run_dispute(result.booking_id, "price_dispute", "Charged too much")
        return {"orchestration": result, "dispute": dispute}

    if scenario == DemoScenario.provider_cancel:
        from app.models.schemas import AgentTraceEntry
        from datetime import datetime

        result.status = "rescheduled"
        result.traces.append(
            AgentTraceEntry(
                agent="Workflow Orchestrator Agent",
                action="auto_reschedule",
                message="Provider cancelled — auto-rescheduled to backup provider",
                timestamp=datetime.utcnow(),
            )
        )

    return result
