from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.llm_client import ask_resilient_agent

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def handle_chat(payload: ChatRequest):
    try:
        reply = ask_resilient_agent(payload.message)
        return {"status": "success", "response": reply}
    except Exception as e:
        # This will intercept the exact TrueFoundry cloud error message 
        # and print it directly inside your VS Code terminal window
        print("\n" + "="*50)
        print(f"🚨 ACTUAL TRUEFOUNDRY ERROR: {str(e)}")
        print("="*50 + "\n")
        
        raise HTTPException(status_code=502, detail=f"Gateway Error: {str(e)}")