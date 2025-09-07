from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    WATSONX_API_KEY: str = Field(...)
    WATSONX_PROJECT_ID: str = Field(...)
    WATSONX_URL: str = "https://eu-gb.ml.cloud.ibm.com"
    WATSONX_MODEL_ID: str = "ibm/granite-3-8b-instruct"

    MAX_TOKENS: int = 2048
    TEMPERATURE: float = 0.1
    TOP_P: float = 0.9


settings = Settings()  # type: ignore[call-arg]