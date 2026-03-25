# Feature: AI Observability & Cost Intelligence Layer

## Objective

Enable Voxy to track, analyze, and optimize AI usage across chat and voice interactions by implementing a production-grade observability system with optional Cencori integration.

---

## Why This Matters

* Required for Afritech Hackathon Technical Rigour (30%)
* Prevents uncontrolled AI costs
* Enables businesses to understand and optimize AI usage
* Positions Voxy as infrastructure, not just an app

---

## Core Capabilities

### 1. AI Request Tracking

Track every AI interaction across the system:

* Chat requests
* Voice (TTS / STT)
* Background AI tasks

Each request must log:

* userId
* businessId
* requestType (chat | voice | system)
* provider (OpenAI | Gemini | Claude | etc.)
* model
* inputSize (tokens or chars)
* outputSize
* latency (ms)
* estimatedCost
* status (success | error)
* timestamp

---

### 2. Cost Estimation Engine

System must estimate cost per request using predefined pricing rules.

Example:

* GPT: cost per 1K tokens
* TTS: cost per character or minute

Must support:

* Multiple providers
* Dynamic pricing config (config file or DB)

---

### 3. Latency Monitoring

Capture:

* Request start time
* Response end time
* Total duration

Used for:

* Performance insights
* Provider comparison

---

### 4. Observability Dashboard (Admin)

Inside /lighthouse:

Display:

* Total AI Requests
* Total Estimated Cost
* Avg Latency
* Requests over time (chart)
* Cost over time (chart)
* Breakdown by:

  * request type
  * provider
  * business

---

### 5. Insight Layer (Lightweight)

Generate simple insights:

* “Voice costs 2x more than chat”
* “Usage increased X% this week”
* “Most used provider: Gemini”

---

### 6. Cencori Integration (Optional but Recommended)

If integrated:

* Route AI calls through Cencori SDK/API
* Use it for:

  * Logging
  * Cost tracking
  * Multi-LLM routing

Fallback:

* If Cencori unavailable → use internal tracking system

---

## Non-Goals

* No complex billing system yet
* No real-time streaming analytics
* No heavy ML insights

---

## Technical Approach

### Wrapper Pattern (Critical)

All AI calls must go through a unified wrapper:

trackAIUsage(async () => {
return await callLLM(...)
})

---

### Storage

New table/collection:

ai_usage_logs

---

### API Endpoints

GET /api/admin/ai/metrics
GET /api/admin/ai/usage
GET /api/admin/ai/cost

---

## Success Criteria

* Every AI call is logged
* Cost is visible per business
* Admin dashboard shows real data
* Demo clearly shows tracking working

---
