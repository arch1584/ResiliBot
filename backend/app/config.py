import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    TRUEFOUNDRY_API_KEY: str = os.getenv("TRUEFOUNDRY_API_KEY")
    TRUEFOUNDRY_BASE_URL: str = os.getenv("TRUEFOUNDRY_BASE_URL")
    VIRTUAL_MODEL_NAME: str = os.getenv("VIRTUAL_MODEL_NAME")

settings = Settings()