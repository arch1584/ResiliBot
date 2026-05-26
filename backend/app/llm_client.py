import os
import time
import uuid
import traceback
from datetime import datetime
from openai import OpenAI
from tavily import TavilyClient
from app.config import settings

# Initialize TrueFoundry and Tavily Clients safely using your settings configuration
# Configured with an explicit 15.0-second request timeout boundary window
client = OpenAI(
    api_key=settings.TRUEFOUNDRY_API_KEY,
    base_url=settings.TRUEFOUNDRY_BASE_URL,
    timeout=15.0  
)

# Initialize Tavily client via our validated pydantic-settings module
tavily_client = TavilyClient(api_key=settings.TAVILY_API_KEY)

# --- IN-MEMORY STATES REQUIRED BY FRONTEND COMPONENTS ---

# Chaos Simulation state dict for hackathon live demonstrations
chaos_state = {
    "kill-gemini-flash": False,
    "throttle-gpt4": False,
    "drop-mcp": False,
    "rate-limit": False
}

# Routing Policy tracking configuration
routing_metrics = {
    "strategy": "priority fallback",
    "timeoutSeconds": 15,  
    "maxRetries": 3,
    "cacheHits": 0,
    "totalRequests": 0
}

# Cleaned up LLM client arrays optimized for credit preservation and testing
# Gemini is now the primary leader to bypass OpenAI 429 quota exceptions
providers = [
    { "id": "gemini1", "name": "gemini-3.5-flash", "status": "active", "latencyMs": 0, "maxLatencyMs": 3000, "role": "primary" },
    { "id": "gemini2", "name": "gemini-3.1-flash-lite", "status": "active", "latencyMs": 0, "maxLatencyMs": 3000, "role": "fallback-1" },
    { "id": "gpt4", "name": "gpt-4o-mini", "status": "active", "latencyMs": 0, "maxLatencyMs": 3000, "role": "fallback-2" }
]

latency_history = []  # Holds a rolling max of 30 ticks
events = []           # Keeps active event logs

def log_event(severity: str, message: str):
    """Appends structural logs into memory for the frontend EventFeed component."""
    events.append({
        "id": str(uuid.uuid4()),
        "timestamp": datetime.utcnow().isoformat(),
        "severity": severity,
        "message": message
    })

# --- REWORKED MULTI-AGENT ARCHITECTURE ---

def orchestrator_agent(task: str) -> str:
    """LLM Call 1: Converts incoming task into a concise keyword search query under 100 characters."""
    log_event("info", f"New task received, starting orchestration: '{task}'")
    start_time = time.time()
    
    try:
        response = client.chat.completions.create(
            model=settings.VIRTUAL_MODEL_NAME,
            messages=[
                {
                    "role": "system", 
                    "content": (
                        "You are an orchestration router. Your sole job is to convert the user's intent "
                        "into a single, concise web search query. Do not include paragraphs, conversational filler, "
                        "or structural markdown labels. Output ONLY the search query string (under 100 characters)."
                    )
                },
                {"role": "user", "content": f"Task to plan a search for: {task}"}
            ]
        )
        # Strip accidental outer quotes away from the model's text generation string output
        search_query = response.choices[0].message.content.strip().replace('"', '').replace("'", "")
        duration = int((time.time() - start_time) * 1000)
        
        log_event("success", f"Orchestrator generated search query in {duration}ms: '{search_query}'")
        return search_query
        
    except Exception as e:
        log_event("error", f"Orchestrator core failure: {str(e)}")
        print(f"\n❌ ORCHESTRATOR AGENT CRASHED:")
        traceback.print_exc()
        raise e

def specialist_agent(subtask: str) -> str:
    """LLM Call 2: Executes a localized search and processes the final content."""
    search_results = None
    
    # SAFE LOCAL INTEGRATION FLAG: 
    # Set to False to bypass local DNS/Network resolution issues with api.tavily.com
    USE_LIVE_WEB_SEARCH = False  
    
    if USE_LIVE_WEB_SEARCH and not chaos_state["drop-mcp"]:
        try:
            start_search = time.time()
            search_results = tavily_client.search(subtask)
            search_duration = int((time.time() - start_search) * 1000)
            log_event("success", f"Web search returned results in {search_duration}ms")
        except Exception as e:
            print(f"⚠️ Tavily Search tool failed processing: {str(e)}")
            search_results = None
    else:
        log_event("warn", "MCP tool unavailable, proceeding with model internal knowledge base")

    # Resolve active provider with dynamic fallback tracking loops for complex deep-dives
    return execute_llm_with_fallback(
        system_prompt=(
            "You are ResiliBot, a technical specialist researcher. Provide a comprehensive, "
            "detailed, and structured technical analysis for the complex task or code layout requested."
        ),
        user_prompt=f"Task: {subtask}\nContext data: {search_results or 'unavailable'}"
    )

def execute_llm_with_fallback(system_prompt: str, user_prompt: str) -> str:
    """Iterates through active providers manually to simulate resilience and register system statistics."""
    routing_metrics["totalRequests"] += 1
    
    # Cleaned TrueFoundry routing rules architecture mapping array properties
    model_mapping = {
        "gemini1": "gemini/gemini-3.5-flash",
        "gemini2": "gemini/gemini-3.1-flash-lite",
        "gpt4": "openai/gpt-4o-mini"
    }

    current_tick = {"time": datetime.now().strftime("%H:%M:%S")}
    final_response_content = None

    # Simulate Rate Limit Chaos on the root target
    primary_rate_limited = chaos_state["rate-limit"]
    
    for provider in providers:
        p_id = provider["id"]
        
        # 1. Evaluate Chaos Drop Actions
        if p_id == "gemini1" and chaos_state["kill-gemini-flash"]:
            log_event("warn", f"Provider {provider['name']} failure simulated: offline.")
            provider["status"] = "offline"
            current_tick[p_id] = None
            continue

        if p_id == "gpt4" and primary_rate_limited:
            log_event("warn", "Rate limit simulated on primary provider, rerouting...")
            provider["status"] = "degraded"
            current_tick[p_id] = None
            continue

        # 2. Evaluate Artificial Injected Throttle Delay
        if p_id == "gpt4" and chaos_state["throttle-gpt4"]:
            log_event("info", "Injecting artificial 3-second sleep latency on GPT4...")
            time.sleep(3)

        # Attempt Execution
        target_model = model_mapping.get(p_id, settings.VIRTUAL_MODEL_NAME)
        try:
            start_time = time.time()
            
            # Standard, widely-supported parameters across different providers via gateway
            response = client.chat.completions.create(
                model=target_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ]
            )
            
            latency = int((time.time() - start_time) * 1000)
            
            # 3. Detect Cache Hits (<50ms processing bounds)
            if latency < 50:
                routing_metrics["cacheHits"] += 1
                log_event("info", f"Cache hit detected for {provider['name']}")

            # Save execution properties to current lifecycle loops
            provider["status"] = "active" if latency < 1500 else "degraded"
            provider["latencyMs"] = latency
            current_tick[p_id] = latency
            
            log_event("success", f"{provider['name']} responded successfully in {latency}ms")
            final_response_content = response.choices[0].message.content
            break  # Successfully handled the request, exit the fallback loop!
            
        except Exception as e:
            provider["status"] = "offline"
            provider["latencyMs"] = 0
            current_tick[p_id] = None
            
            print(f"❌ Provider '{provider['name']}' ({target_model}) failed. Exception details: {str(e)}")
            log_event("error", f"Provider {provider['name']} error: {str(e)}. Attempting dynamic failover...")

    # Append structural ticks mapping array history matrix
    latency_history.append(current_tick)
    if len(latency_history) > 30:
        latency_history.pop(0)

    if not final_response_content:
        raise RuntimeError("All configured fallback providers failed to process the transaction layout.")
        
    return final_response_content

# --- FOOLPROOF HIGH-LEVEL CONTROLLER CONCISENESS INTEGRATION ---

def ask_resilient_agent(task: str) -> str:
    """High-level system composition layer synthesizing user outputs with automated size pruning."""
    clean_task = task.strip().lower().replace(".", "").replace("!", "").replace("?", "")
    
    # 1. Handle casual conversational greetings instantly
    greetings = ["hi", "hello", "hey", "hi resilibot", "hello resilibot", "hey resilibot"]
    if clean_task in greetings:
        return "Hey! I'm ResiliBot, your resilient assistant. How can I help you today?"
        
    # 2. INTENT CLASSIFICATION STEP:
    # Check if the query is a simple factual request, greeting, or conversational query.
    # If it is simple, we route it directly to a single quick execution window with zero orchestration overhead.
    is_complex_request = any(keyword in clean_task for keyword in [
        "code", "program", "script", "function", "write an essay", "explain architecture", 
        "circuit breaker", "fallback", "chaos", "design", "system layout", "develop", "steps to"
    ])
    
    if not is_complex_request:
        log_event("info", "Simple factual prompt detected. Executing via direct concise engine pipeline.")
        try:
            # We process the query directly using our robust fallback channel with a strict layout prompt
            return execute_llm_with_fallback(
                system_prompt=(
                    "You are ResiliBot, a direct and ultra-concise assistant. "
                    "Answer the user's factual question immediately in a single, precise, and natural sentence. "
                    "Do NOT add markdown headers, bold summary blocks, bullet points, or reference notes. "
                    "Example response style: 'The current President of India is Smt. Droupadi Murmu.'"
                ),
                user_prompt=f"Answer cleanly: {task}"
            )
        except Exception as e:
            print(f"⚠️ Direct path exception: {str(e)}")
            # If the direct path hit a network glitch, let it gracefully step down to the multi-agent loop below
            pass

    # 3. For true technical tasks (code requests, complex breakdowns), run the full multi-agent orchestration loop
    plan = orchestrator_agent(task)
    result = specialist_agent(plan)
    return result