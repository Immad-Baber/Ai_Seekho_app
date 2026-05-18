# AI Service Orchestrator Walkthrough

This document outlines the architecture and features of the **Antigravity AI Service Orchestrator**, designed for the informal service economy.

## 1. Multilingual Understanding
The system uses a custom `intentParser` that handles:
- **English**: "I need a plumber for a leakage."
- **Urdu**: "نل ٹپک رہا ہے، پلمبر چاہیے۔"
- **Roman Urdu**: "AC bilkul kaam nahi kar raha, technician chahiye."

It extracts entities such as **Service Type**, **Location**, **Urgency**, and **Price Sensitivity**.

## 2. Antigravity Orchestrator
The orchestrator acts as the "brain," coordinating between the parser, matching engine, and pricing logic. It maintains a **Reasoning Trace** that can be viewed by clicking the **Info (i)** icon in the app.

### Orchestration Steps:
1. **Intent Extraction**: Parse natural language into structured data.
2. **Provider Discovery**: Query mock dataset (or APIs) based on service type.
3. **Multi-Factor Ranking**: Apply weighted scores based on 8+ factors.
4. **Dynamic Pricing**: Calculate estimates based on urgency, distance, and complexity.
5. **Workflow Management**: Transition from selection to booking and dispute resolution.

## 3. Advanced Provider Matching
Our algorithm uses a weighted scoring system (+/- points):
| Factor | Weight | Logic |
| :--- | :--- | :--- |
| **Availability** | High (+30) | Matches requested time slot (morning/afternoon/evening). |
| **Reliability** | Med (+20) | Based on historical completion and on-time rates. |
| **Distance** | Med (-2/km) | Penalizes distance to minimize travel time. |
| **Rating** | Med (+15) | User feedback score (1-5 stars). |
| **Price Match** | Low (+15) | Boosts budget-friendly providers if user is price sensitive. |
| **Cancellation** | Med (-15) | High cancellation rates reduce the provider's rank. |

## 4. Dynamic Pricing Engine
Transparent pricing is calculated on-the-fly:
- **Base Fee**: The provider's standard visit charge.
- **Urgency Surge**: +20% for emergency/urgent requests.
- **Distance Fee**: Additional charge for travel beyond 3km.
- **Complexity Surcharge**: Added based on the classified job type.
- **Loyalty Discount**: Applied for first-time or price-sensitive users.

## 5. Service Lifecycle Simulation
The app simulates the entire lifecycle:
- **Booking**: Confirmation via simulated WhatsApp/SMS.
- **In-Progress**: Placeholder for en-route updates.
- **Completion**: Feedback loop and rating adjustment.
- **Disputes**: A dedicated "Resolution Center" to handle issues like no-shows or quality complaints.

---

### Stress Test Performance
- **No Provider**: If no matches are found, the system suggests alternatives or asks for clarification.
- **Ambiguity**: If the intent confidence is low, the orchestrator prompts the user for more details.
- **Conflict**: The scheduling intelligence prevents double-booking by checking `currentLoad` vs `capacity`.
