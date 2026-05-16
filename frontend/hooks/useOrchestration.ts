"use client";

import { useEffect, useState } from "react";
import type { OrchestrationResult } from "@/lib/api";

export function useOrchestration() {
  const [data, setData] = useState<OrchestrationResult | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("lastOrchestration");
    if (raw) {
      try {
        setData(JSON.parse(raw));
      } catch {
        setData(null);
      }
    }
  }, []);

  return data;
}
