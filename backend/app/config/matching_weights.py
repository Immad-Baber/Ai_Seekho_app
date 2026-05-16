"""14-factor provider matching weights (must sum to 1.0)."""

MATCHING_WEIGHTS = {
    "distance": 0.12,
    "availability": 0.10,
    "reliability": 0.12,
    "rating": 0.08,
    "review_recency": 0.05,
    "specialization": 0.14,
    "price_compatibility": 0.10,
    "cancellation_history": 0.08,
    "workload": 0.07,
    "user_preferences": 0.05,
    "on_time_score": 0.06,
    "risk_score": 0.05,
    "complexity_fit": 0.05,
    "completion_history": 0.03,
}

COMPLEXITY_LEVELS = ("basic", "intermediate", "complex")
