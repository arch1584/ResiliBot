from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.llm_client import (
    ask_resilient_agent,
    chaos_state,
    routing_metrics,
    providers,
    latency_history,
    events
)

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChaosToggleRequest(BaseModel):
    id: str
    enabled: bool

@router.get("/metrics")
async def get_metrics():
    total = routing_metrics["totalRequests"]
    fallbacks = sum(1 for p in providers if p["status"] in ["degraded", "offline"] and p["role"] != "primary")
    active_latencies = [p["latencyMs"] for p in providers if p["latencyMs"] > 0]
    avg_latency = int(sum(active_latencies) / len(active_latencies)) if active_latencies else 280

    return {
        "requestsServed": total,
        "fallbacksTriggered": fallbacks,
        "avgLatencyMs": avg_latency,
        "uptimePercent": 100,
        "strategy": routing_metrics["strategy"],
        "timeoutSeconds": routing_metrics["timeoutSeconds"],
        "maxRetries": routing_metrics["maxRetries"],
        "cacheHits": routing_metrics["cacheHits"]
    }

@router.get("/providers")
async def get_providers():
    return providers

@router.get("/latency-history")
async def get_latency_history():
    return latency_history

@router.get("/events")
async def get_events():
    return events[-50:]

@router.post("/test-chat")
async def chat_endpoint(payload: ChatRequest):
    try:
        response_text = ask_resilient_agent(payload.message)
        return {"response": response_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))