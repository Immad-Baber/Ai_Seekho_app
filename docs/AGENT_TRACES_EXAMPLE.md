# Example Agent Reasoning Trace

**Request:** `Mujhe kal morning AC service chahiye G-13`

```
[Language Parsing Agent]
Language: Roman Urdu
Confidence: 92%
Code-switching detected — routing to multilingual intent pipeline

[Intent Understanding Agent]
Service: ac, Urgency: high, Location: G-13
Confidence: 91%

[Risk Assessment Agent]
Risk score: 35% — flags: none

[Provider Matching Agent]
Provider CoolAir Bilal rejected: high cancellation rate
Provider Hassan AC Experts selected: AC specialization, score 87%, ETA 18 min

[Dynamic Pricing Agent]
Total PKR 4,850 — urgency: +12%

[Scheduling Agent]
10AM conflict detected — 11:30AM assigned (alternate)

[Booking Agent]
Booking BK-A1B2C3D4 confirmed with Hassan AC Experts

[Notification Agent]
Reminders queued: FCM push, WhatsApp template, SMS -24h/-1h

[Reputation Agent]
Provider trust snapshot logged to analytics pipeline

[Workflow Orchestrator Agent]
Workflow chain executed: antigravity_start → ... → complete
```
