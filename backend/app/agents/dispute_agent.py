import uuid
from typing import Any

from app.agents.base import BaseAgent
from app.models.schemas import DisputeResolution


class DisputeResolutionAgent(BaseAgent):
    name = "Dispute Resolution Agent"

    async def run_dispute(
        self, booking_id: str, dispute_type: str, description: str
    ) -> DisputeResolution:
        traces = []
        compensation = 0.0
        penalty = 0.0
        escalated = False
        resolution = "pending"

        if dispute_type == "price_dispute":
            compensation = 500
            penalty = 0.02
            resolution = "partial_refund_recommended"
            traces.append(
                self.trace(
                    "resolve",
                    "Price variance 18% — PKR 500 credit + provider coaching",
                    details={"compensation": compensation},
                )
            )
        elif dispute_type == "no_show":
            compensation = 1000
            penalty = 0.15
            resolution = "full_credit_user_provider_penalized"
            traces.append(
                self.trace("resolve", "Provider no-show — PKR 1000 credit, trust -15%")
            )
        elif dispute_type == "quality":
            compensation = 300
            penalty = 0.05
            resolution = "quality_review_scheduled"
            traces.append(self.trace("resolve", "Quality complaint — follow-up inspection"))
        else:
            escalated = True
            resolution = "escalated_to_admin"
            traces.append(self.trace("escalate", "Complex dispute — admin review required"))

        return DisputeResolution(
            dispute_id=f"DSP-{uuid.uuid4().hex[:8]}",
            resolution=resolution,
            compensation=compensation,
            provider_penalty=penalty,
            escalated=escalated,
            traces=traces,
        )

    async def run(self, context: dict[str, Any]) -> dict[str, Any]:
        return context
