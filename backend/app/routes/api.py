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

router = APIRouter(prefix="/api/v1")


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

    path = Path(__file__).resolve().parents[3] / "data" / "demo" / "ai_traces.json"
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
