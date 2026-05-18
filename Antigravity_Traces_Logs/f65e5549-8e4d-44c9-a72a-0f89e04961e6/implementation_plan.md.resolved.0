# Challenge Requirements — Gap Analysis & Fix Plan

## Audit Summary

| # | Requirement | Status | Details |
|---|---|---|---|
| 1 | **Intent Understanding** | ✅ PASS | Language Agent (Urdu/Roman Urdu/English), Intent Agent (service/location/time extraction via Gemini + rule-based fallback) |
| 2 | **Provider Discovery** | ✅ PASS | Mock provider dataset in backend `data_store.py`, matching engine ranks by distance/category. Frontend also has `PROVIDER_POOL` in `agent.ts` |
| 3 | **Matching & Ranking** | ✅ PASS | `matching_engine.rank_providers()` scores on 8 factors (distance, availability, rating, specialization, etc.) with clear weighted scoring |
| 4 | **Decision & Recommendation** | ✅ PASS | Shows selected provider + all options on `/providers` page. AI explains selection with match score |
| 5 | **Action Simulation** | ⚠️ PARTIAL | Booking confirmed ✅, Provider assigned ✅, Scheduling ✅, Confirmation message ✅, **Booking receipt ❌ MISSING**, Database write ✅ |
| 6 | **Follow-Up Automation** | ⚠️ WEAK | Notification agent logs channels but **no actual reminder UI**, **no status update flow**, **no completion confirmation** |
| 7 | **Agentic Workflow** | ⚠️ PARTIAL | 11-agent pipeline ✅, Traceable logs ✅, But **reasoning page is too thin** — doesn't show planning→decision→action→follow-up clearly |

---

## Gaps to Fix

### Gap 1: No Booking Receipt (Requirement 5)
**Problem:** After booking, there's no receipt/confirmation document the user can see.
**Fix:** Create a `/receipt` page that shows a formal booking receipt with all details.

### Gap 2: Follow-Up Automation is Weak (Requirement 6)
**Problem:** Notification Agent logs "reminder scheduled" in traces but user never sees actual reminders, status updates, or completion confirmation.
**Fix:** 
- Add scheduled reminder notifications to customer's notification feed (1hr before, upon arrival)
- Add a **completion confirmation** flow — customer can mark service as "done" from bookings page
- Add **status update** push notifications (provider en route, arrived, completed)

### Gap 3: Reasoning Page Too Thin (Requirement 7)
**Problem:** `/reasoning` page just lists trace messages. Challenge requires showing **"planning → decision → action → follow-up"** pipeline clearly with tool usage logs.
**Fix:** Enhance the reasoning page to group traces by pipeline phase, show the complete workflow chain visually, and display each agent's decision with confidence + tool usage.

### Gap 4: No Completion Confirmation Flow (Requirement 6)
**Problem:** After booking, there's no way to complete the lifecycle (arrive → in-progress → completed → feedback).
**Fix:** Enhance the tracking page with actual completion actions and auto-generate follow-up notifications.

---

## Proposed Changes

### 1. New: Booking Receipt Page

#### [NEW] `frontend/app/receipt/page.tsx`
- Formal booking receipt with: Booking ID, service type, provider name, price breakdown, schedule, QR-style booking reference
- Print-ready layout
- Shows "AI Decision Summary" section matching challenge requirements

---

### 2. Enhanced Follow-Up Automation

#### [MODIFY] `frontend/app/page.tsx`
- After auto-booking, schedule follow-up reminder notifications:
  - Immediate: "Booking confirmed" ✅ (already exists)
  - +Reminder: "1 ghanta pehle — apka ustaad aa raha hai" (scheduled)
  - +Status: "Ustaad en route" 
  - +Completion: "Service mukammal — feedback dein"

#### [MODIFY] `frontend/app/tracking/page.tsx`
- Add "Mark as Complete" button when status reaches "completed"
- When completed, auto-generate:
  - Completion notification
  - Feedback prompt notification
  - Provider review prompt

#### [MODIFY] `frontend/app/bookings/page.tsx`
- Add status update indicators
- Add "Rate Service" link for completed bookings

---

### 3. Enhanced Reasoning / Agentic Workflow Page

#### [MODIFY] `frontend/app/reasoning/page.tsx`
- Group traces into 4 phases: **Planning** → **Decision** → **Action** → **Follow-up**
- Show workflow_chain as a visual pipeline diagram
- For each agent, show: name, action, decision message, confidence score, tool used
- Highlight when fallback was used
- Show timing of each step

---

### 4. Enhanced Notification Agent (Backend)

#### [MODIFY] `backend/app/agents/notification_agent.py`
- Generate follow-up reminder entries in traces with specific times
- Add completion confirmation entry

---

## Files to Create/Modify

| File | Action | Purpose |
|---|---|---|
| `frontend/app/receipt/page.tsx` | **NEW** | Booking receipt (Req 5) |
| `frontend/app/page.tsx` | MODIFY | Schedule follow-up notifications (Req 6) |
| `frontend/app/tracking/page.tsx` | MODIFY | Completion flow + status updates (Req 6) |
| `frontend/app/bookings/page.tsx` | MODIFY | Rate/feedback link for completed (Req 6) |
| `frontend/app/reasoning/page.tsx` | MODIFY | Enhanced agentic workflow view (Req 7) |
| `backend/app/agents/notification_agent.py` | MODIFY | Follow-up trace entries (Req 6) |

## Verification Plan

### Automated Tests
- Run through the full flow in browser: register → book → check receipt → check reasoning → check tracking completion

### Manual Verification
- Verify all 7 requirements have clear UI evidence
- Screenshot each requirement checkpoint for hackathon submission
