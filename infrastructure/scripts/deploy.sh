#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:?Set GOOGLE_CLOUD_PROJECT}"
REGION="${REGION:-us-central1}"

echo "Building API..."
docker build -t "gcr.io/${PROJECT_ID}/serviceflow-api:latest" ./backend
docker push "gcr.io/${PROJECT_ID}/serviceflow-api:latest"

echo "Deploying Cloud Run..."
gcloud run deploy serviceflow-api \
  --image "gcr.io/${PROJECT_ID}/serviceflow-api:latest" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=${PROJECT_ID},USE_MOCK_GCP=false,VERTEX_AI_LOCATION=${REGION}"

echo "Deploying Workflow..."
gcloud workflows deploy booking-lifecycle \
  --source=./infrastructure/workflows/booking-lifecycle.yaml \
  --location="$REGION"

echo "Done. Set NEXT_PUBLIC_API_URL to Cloud Run URL for frontend."
