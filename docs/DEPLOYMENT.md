# Deployment Guide

## Local development

```bash
# Terminal 1 — API
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8080

# Terminal 2 — Web
cd frontend && npm install && npm run dev
```

## Google Cloud prerequisites

Enable APIs:

- Cloud Run, Cloud Build, Artifact Registry
- Vertex AI, Gemini API
- Firestore, Cloud SQL Admin
- Maps Platform (Distance Matrix, Places, Geocoding)
- Speech-to-Text, Translation, Natural Language API
- Pub/Sub, Workflows, Eventarc
- Cloud Logging, Monitoring, Error Reporting, Cloud Trace
- Secret Manager, Firebase

## Secrets (Secret Manager)

- `gemini-api-key`
- `google-maps-api-key`
- `twilio-auth-token`

Mount in Cloud Run:

```bash
gcloud run services update serviceflow-api \
  --set-secrets=GEMINI_API_KEY=gemini-api-key:latest
```

## Cloud Run

```bash
export GOOGLE_CLOUD_PROJECT=your-project
bash infrastructure/scripts/deploy.sh
```

## Firebase Hosting

```bash
cd frontend && npm run build
cd ../infrastructure/firebase && firebase deploy --only hosting
```

## Firestore

Import security rules and create indexes for `bookings`, `providers`, `ai_traces`.

## BigQuery

Stream booking events via Pub/Sub → Dataflow or Cloud Functions for demand forecasting dashboards in Looker Studio.

## Monitoring

- Cloud Logging: filter `jsonPayload.service="serviceflow"`
- Alerts on orchestration failure rate > 5%
- Trace all `/api/v1/orchestrate` requests

## Scalability

| Layer | Strategy |
|-------|----------|
| API | Cloud Run 1–20 instances, 80 concurrency |
| Agents | Async pipeline; Vertex batch for heavy ranking |
| DB | Firestore hot path; Cloud SQL + BigQuery analytics |
| Events | Pub/Sub → Workflows for lifecycle |
| CDN | Firebase Hosting + Cloud CDN |
