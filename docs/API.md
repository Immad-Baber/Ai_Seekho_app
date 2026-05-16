# API Reference

Base URL: `http://localhost:8080` (local) or Cloud Run URL (prod)

## POST /api/v1/orchestrate

Main Antigravity orchestration endpoint.

```json
{
  "message": "Mujhe kal morning AC service chahiye G-13",
  "user_id": "demo-user-1",
  "voice_transcript": null,
  "locale": "ur-PK"
}
```

Response includes: `intent`, `matches`, `pricing`, `schedule`, `booking_id`, `traces`, `workflow_chain`.

## POST /api/v1/demo/{scenario}

Scenarios: `ac-repair`, `ambiguous-input`, `schedule-conflict`, `no-provider`, `provider-cancel`, `price-dispute`

## GET /api/v1/providers

## GET /api/v1/bookings?user_id=

## POST /api/v1/disputes

## GET /api/v1/traces?limit=50

## GET /health
