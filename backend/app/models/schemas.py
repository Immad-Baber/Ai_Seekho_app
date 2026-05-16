from datetime import datetime
from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel, Field


class Urgency(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    emergency = "emergency"


class Complexity(str, Enum):
    basic = "basic"
    intermediate = "intermediate"
    complex = "complex"


class BookingStatus(str, Enum):
    draft = "draft"
    intent_parsed = "intent_parsed"
    providers_ranked = "providers_ranked"
    priced = "priced"
    scheduled = "scheduled"
    confirmed = "confirmed"
    provider_assigned = "provider_assigned"
    en_route = "en_route"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"
    disputed = "disputed"
    waitlisted = "waitlisted"


class ParsedIntent(BaseModel):
    raw_message: str
    detected_language: str = "mixed"
    service_type: Optional[str] = None
    service_category: Optional[str] = None
    urgency: Urgency = Urgency.medium
    location_text: Optional[str] = None
    location_coords: Optional[dict[str, float]] = None
    time_preference: Optional[str] = None
    budget_sensitivity: str = "medium"
    issue_severity: str = "medium"
    constraints: list[str] = Field(default_factory=list)
    user_preferences: list[str] = Field(default_factory=list)
    complexity: Complexity = Complexity.basic
    confidence: float = 0.0
    needs_clarification: bool = False
    clarification_questions: list[str] = Field(default_factory=list)


class FactorScore(BaseModel):
    factor: str
    score: float
    weight: float
    weighted: float
    note: Optional[str] = None


class ProviderMatch(BaseModel):
    provider_id: str
    name: str
    total_score: float
    factor_scores: list[FactorScore] = Field(default_factory=list)
    selected: bool = False
    rejection_reasons: list[str] = Field(default_factory=list)
    distance_km: Optional[float] = None
    eta_minutes: Optional[int] = None
    hourly_rate: float = 0
    specialization: list[str] = Field(default_factory=list)


class PricingLineItem(BaseModel):
    label: str
    amount: float
    multiplier: Optional[float] = None
    description: Optional[str] = None


class PricingBreakdown(BaseModel):
    base_price: float
    line_items: list[PricingLineItem]
    subtotal: float
    tax: float = 0
    total: float
    currency: str = "PKR"
    surge_applied: bool = False
    loyalty_discount: float = 0


class ScheduleSlot(BaseModel):
    start: datetime
    end: datetime
    provider_id: str
    buffer_minutes: int = 30
    conflict_detected: bool = False
    alternate_slots: list[dict[str, Any]] = Field(default_factory=list)


class AgentTraceEntry(BaseModel):
    agent: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    action: str
    confidence: Optional[float] = None
    details: dict[str, Any] = Field(default_factory=dict)
    message: str = ""


class OrchestrationRequest(BaseModel):
    message: str
    user_id: str = "demo-user"
    voice_transcript: Optional[str] = None
    locale: str = "ur-PK"
    preferred_language: Optional[str] = None
    location_override: Optional[dict[str, float]] = None


class OrchestrationResponse(BaseModel):
    trace_id: str
    intent: ParsedIntent
    matches: list[ProviderMatch]
    selected_provider: Optional[ProviderMatch] = None
    pricing: Optional[PricingBreakdown] = None
    schedule: Optional[ScheduleSlot] = None
    booking_id: Optional[str] = None
    status: str
    traces: list[AgentTraceEntry]
    workflow_chain: list[str] = Field(default_factory=list)
    fallback_used: bool = False
    edge_case: Optional[str] = None


class DisputeRequest(BaseModel):
    booking_id: str
    type: str
    description: str
    user_id: str


class DisputeResolution(BaseModel):
    dispute_id: str
    resolution: str
    compensation: float = 0
    provider_penalty: float = 0
    escalated: bool = False
    traces: list[AgentTraceEntry] = Field(default_factory=list)


class DemoScenario(str, Enum):
    ac_repair = "ac-repair"
    plumber_urgent = "plumber-urgent"
    electrician_wiring = "electrician-wiring"
    beautician_home = "beautician-home"
    tutor_math = "tutor-math"
    mechanic_car = "mechanic-car"
    driver_airport = "driver-airport"
    cleaning_safai = "cleaning-safai"
    appliance_repair = "appliance-repair"
    home_repair = "home-repair"
    provider_cancel = "provider-cancel"
    ambiguous_input = "ambiguous-input"
    price_dispute = "price-dispute"
    schedule_conflict = "schedule-conflict"
    no_provider = "no-provider"
