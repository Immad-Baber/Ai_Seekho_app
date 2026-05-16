from typing import Any

from app.agents.base import BaseAgent


class WorkflowOrchestratorAgent(BaseAgent):
    name = "Workflow Orchestrator Agent"

    async def run(self, context: dict[str, Any]) -> dict[str, Any]:
        chain = context.get("workflow_chain", [])
        chain.append("antigravity_pipeline_complete")
        context["workflow_chain"] = chain
        context.setdefault("traces", []).append(
            self.trace(
                "complete",
                f"Workflow chain executed: {' → '.join(chain)}",
                details={"steps": len(chain)},
            )
        )
        return context
