# ResiliBot — AI Mission Control

> A fault-tolerant, multi-agent AI system that keeps working when your infrastructure doesn't.

Built for the **TrueFoundry: Resilient Agents** hackathon track. ResiliBot demonstrates how an AI agent system should behave when LLM providers fail, MCP tools go down, or rate limits are hit — surfacing every failure and recovery decision in real time through a live mission control dashboard.

---

## Overview

Most AI agents fail silently or crash entirely when a provider goes down. ResiliBot is built around the principle that **resilience should be observable** — the system handles failures automatically while making every routing decision visible to the operator.

The application consists of two parts:

- **Agent Chat (right panel)** — a user-facing interface where tasks are submitted to a multi-agent pipeline. The user experience remains uninterrupted regardless of backend failures.
- **Mission Control Dashboard (left panel)** — a real-time operations panel showing provider health, latency trends, live event logs, routing policy, and chaos controls for injecting failures on demand.

---

## Architecture

```
User Prompt
    ↓
FastAPI Backend
    ↓
Orchestrator Agent (LLM Call 1)
  → breaks task into subtasks
  → decides which tools to invoke
    ↓
Specialist Agent (LLM Call 2)
  → executes subtask with Tavily web search
  → gracefully degrades if search tool is unavailable
    ↓
TrueFoundry AI Gateway
  → priority-based fallback routing across providers
  → automatic retries with backoff
  → request logging and observability
    ↓
LLM Providers (in priority order)
  1. Gemini 3.5 Flash      (primary)
  2. Gemini 3.1 Flash Lite (fallback-1)
  3. OpenAI GPT-4o Mini    (fallback-2)
```

---

## Resilience Layers

ResiliBot handles failures at two distinct layers:

**Layer 1 — LLM Provider Failures (handled by TrueFoundry)**
When a provider times out, returns a 5xx error, or hits a rate limit, TrueFoundry's AI Gateway automatically retries and routes to the next provider in the priority chain. The application code never changes — the gateway handles this transparently.

**Layer 2 — Tool Failures (handled by agent code)**
When the Tavily web search tool is unavailable, the specialist agent continues without it — using its training knowledge and explicitly flagging in the response that search results were unavailable. The task completes with reduced capability rather than failing entirely.

---

## Chaos Controls

The dashboard includes live chaos injection controls for demo and testing purposes:

| Toggle | Effect |
|---|---|
| Kill Gemini 3.5 Flash | Skips primary provider, forces immediate fallback |
| Throttle Gemini 3.1 Lite | Adds a 3-second artificial delay to simulate degraded latency |
| Rate-limit GPT-4o Mini | Raises a 429 exception, forcing reroute |
| Drop Search Tool | Disables Tavily web search, agent proceeds without it |

Every chaos event is logged to the live event feed with a timestamp and severity level.

---

## Dashboard Components

| Component | Data Source |
|---|---|
| **Metric Cards** | Backend counters — requests served, active sessions, avg latency, uptime |
| **Provider Health List** | Per-request latency measurements and status tracking in backend |
| **Live Latency Graph** | Rolling 30-tick history polled from `/api/latency-history` every 2 seconds |
| **Event Feed** | In-memory event log appended on every notable agent action |
| **Chaos Controls** | Frontend state synced to backend `chaos_state` dict via `POST /api/chaos` |
| **Routing Policy** | Static TrueFoundry gateway configuration display |

---

## Tech Stack

**Frontend**
- React + TypeScript (Vite)
- Tailwind CSS
- Recharts (latency graph)

**Backend**
- Python + FastAPI
- TrueFoundry AI Gateway (LLM routing, fallbacks, observability)
- Tavily Python SDK (web search tool)
- OpenAI-compatible client pointed at TrueFoundry gateway

**Infrastructure**
- TrueFoundry AI Gateway with priority fallback virtual model
- Providers: Gemini 3.5 Flash, Gemini 3.1 Flash Lite, OpenAI GPT-4o Mini

---

## API Endpoints

```
POST /api/chat             Send a task to the multi-agent pipeline
GET  /api/metrics          Session metrics — requests, latency, uptime
GET  /api/providers        Current status and latency per LLM provider
GET  /api/latency-history  Rolling 30-tick latency history per provider
GET  /api/events           Last 50 event log entries with severity
POST /api/chaos            Toggle chaos injection { id, enabled }
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- TrueFoundry account with AI Gateway configured
- Tavily API key

### Backend

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file:
```
TRUEFOUNDRY_API_KEY=your_key_here
TRUEFOUNDRY_GATEWAY_URL=https://your-workspace.truefoundry.com/api/llm
TAVILY_API_KEY=your_key_here
VIRTUAL_MODEL_NAME=your_virtual_model_name
```

```bash
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Project Structure

```
ResiliBot/
├── backend/
│   ├── main.py               FastAPI app entry point
│   └── app/
│       ├── __init__.py
│       ├── config.py         Environment variables and settings
│       ├── llm_client.py     TrueFoundry gateway client and agent logic
│       └── routes.py         API endpoint definitions
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── cards/
│   │   │   │   ├── ChaosControls.tsx
│   │   │   │   ├── EventFeed.tsx
│   │   │   │   ├── LatencyGraph.tsx
│   │   │   │   ├── MetricCards.tsx
│   │   │   │   ├── ProviderHealthList.tsx
│   │   │   │   └── RoutingPolicy.tsx
│   │   │   ├── dashboardTypes.ts   Shared TypeScript interfaces
│   │   │   ├── LeftPanel.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   ├── RightPanel.tsx
│   │   │   └── TopBar.tsx
│   │   ├── services/
│   │   │   └── api.ts              Backend API service layer
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── .env                      Environment variables (not committed)
├── .gitignore
├── LICENSE
├── README.md
└── requirements.txt
```

---

## License

MIT
