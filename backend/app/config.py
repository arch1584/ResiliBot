import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


ROOT_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE_PATH = ROOT_DIR / ".env"

class Settings(BaseSettings):
    # TrueFoundry Credentials
    TRUEFOUNDRY_API_KEY: str
    TRUEFOUNDRY_BASE_URL: str
    VIRTUAL_MODEL_NAME: str

    # Tavily Search API Key
    TAVILY_API_KEY: str

    # Direct absolute link to read the environment variables securely
    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE_PATH),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()