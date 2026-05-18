# ServiceFlow AI — AI Service Orchestrator for Informal Economy

Enterprise-grade, **agentic**, **multilingual**, **cloud-native** orchestration platform for informal economy services (electricians, AC techs, plumbers, beauticians, tutors, mechanics, and more).

Powered by **Google Antigravity** (central orchestrator), **Gemini / Vertex AI**, and the full Google Cloud stack.

## What This Is

Not a simple marketplace. An **autonomous AI operations platform** that manages the complete service lifecycle:

- Multilingual intent understanding (Urdu, Roman Urdu, English, mixed)
- Multi-factor provider matching (14+ factors)
- Dynamic pricing with transparent breakdown
- Intelligent scheduling with conflict prevention
- Full booking lifecycle automation
- Dispute resolution & reputation management
- Visible AI reasoning traces

## How it Works (6-Point AI Workflow)

1. **Multilingual Intent Parsing**: The user inputs a problem (e.g., via text or voice) in any language like English, Urdu, or Roman Urdu. The **Intent Agent** translates this and extracts the service category, urgency, and location.
2. **Dynamic Provider Discovery**: The **Discovery Agent** checks the database to find providers who match the requested category and have active availability, filtering out those who are engaged or mismatched.
3. **Multi-Factor Provider Ranking**: The **Ranking Agent** scores available providers based on multiple factors: distance, rating, past performance, and reliability, selecting the absolute best match for the job.
4. **Intelligent Dynamic Pricing**: The **Pricing Agent** calculates a transparent cost structure incorporating base rates, urgency multipliers, and estimated material costs, providing a final clear estimate.
5. **Automated Booking & Scheduling**: The **Booking Agent** locks in the optimal provider, creates a confirmed booking, prevents schedule conflicts, and notifies both parties simultaneously.
6. **Continuous Orchestration & Fallback**: The **Antigravity Orchestrator** monitors the entire process in real time. It handles edge cases, such as an ambiguous request (by asking follow-up questions) or provider unavailability, ensuring a seamless fallback.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENTS (Mobile-First PWA)                       │
│   User App │ Provider App │ Admin / AI Monitoring Dashboard              │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ HTTPS / WebSocket
┌───────────────────────────────▼─────────────────────────────────────────┐
│                    Firebase Hosting + Cloud CDN                            │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────────┐
│              Cloud Run — FastAPI Orchestration API                       │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │           Google Antigravity Orchestrator (Primary)             │   │
│  │  Intent → Language → Risk → Match → Price → Schedule → Book    │   │
│  │  → Notify → Reputation → Dispute → Escalation → Workflow         │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└───┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────────────┘
    │         │         │         │         │         │
    ▼         ▼         ▼         ▼         ▼         ▼
 Firestore  Cloud SQL  Vertex AI  Maps API  Pub/Sub  Cloud Storage
 (realtime) (analytics) Gemini   Places    Events   Media/Logs
    │         │         │         │         │
    ▼         ▼         ▼         ▼         ▼
 BigQuery  Workflows  FCM/Twilio  Speech/Translation  Cloud Logging
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full design, sequence diagrams, and GCP service mapping.

## Monorepo Structure

```
service-orchestrator/
├── backend/          # FastAPI + 12 AI agents + engines
├── frontend/         # Next.js 14 mobile-first PWA
├── infrastructure/   # Cloud Run, Workflows, Firebase, CI/CD
├── database/         # Firestore + PostgreSQL schemas
├── data/demo/        # Realistic provider & booking datasets
└── docs/             # Architecture, API, agent traces
```

## Quick Start (Local Demo)

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker (optional)

### Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8080
```

API: http://localhost:8080  
Docs: http://localhost:8080/docs

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

App: http://localhost:3000

### Docker (full stack)

```bash
docker compose up --build
```

## Demo Workflows

Use the **Demo** panel in the app or call `POST /api/v1/demo/{scenario}`:

| Scenario | Endpoint | Description |
|----------|----------|-------------|
| AC repair booking | `ac-repair` | Full orchestration flow |
| Plumber urgent | `plumber-urgent` | Leak/geyser request with budget sensitivity |
| Electrician wiring | `electrician-wiring` | Wiring/fan matching and pricing |
| Beautician at home | `beautician-home` | Home salon scheduling |
| Tutor | `tutor-math` | Preference-aware tutor matching |
| Mechanic | `mechanic-car` | Vehicle issue classification |
| Driver | `driver-airport` | Time-sensitive airport drop |
| Safai / cleaning | `cleaning-safai` | Deep-clean workload and team matching |
| Appliance repair | `appliance-repair` | Washing machine repair |
| Home repair | `home-repair` | Mistri/carpenter/lock repair |
| Provider cancellation | `provider-cancel` | Auto-reschedule + notify |
| Ambiguous input | `ambiguous-input` | Clarification questions |
| Price dispute | `price-dispute` | Dispute agent + compensation |
| Scheduling conflict | `schedule-conflict` | Alternate slot assignment |
| No provider | `no-provider` | Waitlist + escalation |

### Example: Multilingual request

```bash
curl -X POST http://localhost:8080/api/v1/orchestrate \
  -H "Content-Type: application/json" \
  -d '{"message": "Mujhe kal morning AC service chahiye G-13 mein", "user_id": "demo-user-1"}'
```

## Google Cloud Setup

1. Create GCP project, enable APIs (Vertex AI, Maps, Speech, Translation, Firestore, etc.)
2. Set `GOOGLE_CLOUD_PROJECT`, `VERTEX_AI_LOCATION`, `GEMINI_API_KEY` or ADC
3. Deploy: `cd infrastructure && ./scripts/deploy.sh`
4. Firebase: `firebase deploy --only hosting`

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `GOOGLE_CLOUD_PROJECT` | GCP project ID |
| `GEMINI_API_KEY` | Gemini API (or use Vertex ADC) |
| `ANTIGRAVITY_ENDPOINT` | Antigravity gateway URL |
| `GOOGLE_MAPS_API_KEY` | Distance Matrix / Places |
| `FIRESTORE_EMULATOR_HOST` | Local Firestore emulator |
| `USE_MOCK_GCP` | `true` for offline demo without GCP |

## Key Features

- **12 specialized AI agents** coordinated by Antigravity
- **14-factor provider matching** with explainable scores
- **Dynamic pricing** (urgency, surge, complexity, loyalty)
- **Scheduling** with travel buffers & conflict detection
- **Reasoning traces** visible in UI and admin dashboard
- **Urdu / Roman Urdu / English** with confidence scoring
- **Edge-case fallbacks** (API failures, no providers, low confidence)

## License

MIT — Built for hackathon / challenge demonstration.
