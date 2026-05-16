from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any

from app.models.schemas import AgentTraceEntry


class BaseAgent(ABC):
    name: str = "BaseAgent"

    def trace(
        self,
        action: str,
        message: str,
        confidence: float | None = None,
        details: dict | None = None,
    ) -> AgentTraceEntry:
        return AgentTraceEntry(
            agent=self.name,
            action=action,
            message=message,
            confidence=confidence,
            details=details or {},
            timestamp=datetime.utcnow(),
        )

    @abstractmethod
    async def run(self, context: dict[str, Any]) -> dict[str, Any]:
        pass
