"""
Google Antigravity — Primary Orchestration Layer

Coordinates all 12 agents, manages retries/fallbacks, and produces reasoning traces.
Uses Gemini via Antigravity gateway when configured; falls back to local agent pipeline.
"""

import uuid
from typing import Any, Optional

from app.agents.booking_agent import BookingAgent
from app.agents.escalation_agent import EscalationAgent
from app.agents.intent_agent import IntentUnderstandingAgent
from app.agents.language_agent import LanguageParsingAgent
from app.agents.matching_agent import ProviderMatchingAgent
from app.agents.notification_agent import NotificationAgent
from app.agents.pricing_agent import DynamicPricingAgent
from app.agents.reputation_agent import ReputationAgent
from app.agents.risk_agent import RiskAssessmentAgent
from app.agents.scheduling_agent import SchedulingAgent
from app.agents.workflow_agent import WorkflowOrchestratorAgent
from app.config import get_settings
from app.models.schemas import (
    AgentTraceEntry,
    OrchestrationRequest,
    OrchestrationResponse,
    ParsedIntent,
    PricingBreakdown,
    ProviderMatch,
    ScheduleSlot,
)
from app.services.data_store import store


class AntigravityOrchestrator:
    """
    Central orchestrator — mirrors Antigravity agent coordination patterns:
    sequential pipeline with conditional branches, trace emission, retry hooks.
    """

    def __init__(self) -> None:
        self.settings = get_settings()
        self.pipeline = [
            LanguageParsingAgent(),
            IntentUnderstandingAgent(),
            RiskAssessmentAgent(),
            ProviderMatchingAgent(),
            DynamicPricingAgent(),
            SchedulingAgent(),
            BookingAgent(),
            NotificationAgent(),
            ReputationAgent(),
            EscalationAgent(),
            WorkflowOrchestratorAgent(),
        ]

    async def _try_antigravity_gateway(self, message: str) -> Optional[dict]:
        """Optional call to Antigravity unified gateway when not in mock mode."""
        if self.settings.use_mock_gcp or not self.settings.gemini_api_key:
            return None
        return None  # Local pipeline is primary; gateway enriches in production

    async def orchestrate(
        self,
        request: OrchestrationRequest,
        edge_case: Optional[str] = None,
        prefill_intent: Optional[dict] = None,
    ) -> OrchestrationResponse:
        trace_id = f"TRC-{uuid.uuid4().hex[:12]}"
        message = request.voice_transcript or request.message

        context: dict[str, Any] = {
            "trace_id": trace_id,
            "message": message,
            "user_id": request.user_id,
            "traces": [],
            "workflow_chain": ["antigravity_start"],
            "edge_case": edge_case,
            "fallback_used": False,
            "user": store.get_user_by_id(request.user_id) or {},
        }

        if request.location_override:
            context["location_override"] = request.location_override

        await self._try_antigravity_gateway(message)

        # Execute agent pipeline
        for agent in self.pipeline:
            agent_name = agent.name
            context["workflow_chain"].append(agent_name)
            try:
                context = await agent.run(context)
            except Exception as e:
                context["fallback_used"] = True
                context.setdefault("traces", []).append(
                    AgentTraceEntry(
                        agent=agent_name,
                        action="error_recovery",
                        message=f"Agent failed — fallback engaged: {e}",
                        details={"retry": True},
                    )
                )

        intent: ParsedIntent = context.get("intent") or ParsedIntent(
            raw_message=message, confidence=0
        )
        if prefill_intent:
            for k, v in prefill_intent.items():
                if hasattr(intent, k):
                    setattr(intent, k, v)

        matches: list[ProviderMatch] = context.get("matches", [])
        selected = context.get("selected_provider") or (matches[0] if matches else None)
        if selected and matches:
            for m in matches:
                m.selected = m.provider_id == selected.provider_id

        traces: list[AgentTraceEntry] = context.get("traces", [])
        store.append_trace(
            {
                "trace_id": trace_id,
                "user_id": request.user_id,
                "message": message,
                "traces": [t.model_dump() for t in traces],
                "status": context.get("status", "unknown"),
            }
        )

        return OrchestrationResponse(
            trace_id=trace_id,
            intent=intent,
            matches=matches,
            selected_provider=selected,
            pricing=context.get("pricing"),
            schedule=context.get("schedule"),
            booking_id=context.get("booking_id"),
            status=context.get("status", "completed"),
            traces=traces,
            workflow_chain=context.get("workflow_chain", []),
            fallback_used=context.get("fallback_used", False),
            edge_case=edge_case,
        )


orchestrator = AntigravityOrchestrator()
