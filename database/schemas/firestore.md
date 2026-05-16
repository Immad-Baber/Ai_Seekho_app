# Firestore Collections

## users/{userId}
```json
{
  "name": "string",
  "phone": "string",
  "locale": "ur-PK",
  "preferences": ["verified"],
  "loyaltyTier": "gold",
  "coords": { "lat": 0, "lng": 0 }
}
```

## providers/{providerId}
```json
{
  "name": "string",
  "specializations": ["ac"],
  "geo": { "geohash": "...", "lat": 0, "lng": 0 },
  "metrics": { "rating": 4.8, "reliabilityScore": 0.92 },
  "availableNow": true
}
```

## bookings/{bookingId}
Real-time lifecycle updates for live tracking.

## ai_traces/{traceId}
Agent reasoning chains for admin dashboard.

## disputes/{disputeId}
Audit trail with resolution metadata.

## notifications/{notificationId}
FCM delivery status.

## schedules/{providerId}/slots/{slotId}
Provider availability subcollection.
