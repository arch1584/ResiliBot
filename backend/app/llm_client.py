from openai import OpenAI
from app.config import settings

# Initialize the gateway client
client = OpenAI(
    api_key=settings.TRUEFOUNDRY_API_KEY,
    base_url=settings.TRUEFOUNDRY_BASE_URL
)

def ask_resilient_agent(user_prompt: str) -> str:
    response = client.chat.completions.create(
        model=settings.VIRTUAL_MODEL_NAME,
        messages=[{"role": "user", "content": user_prompt}]
    )
    return response.choices[0].message.content