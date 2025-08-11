# app/services/watsonx.py
from ibm_watsonx_ai.foundation_models import ModelInference
from ibm_watsonx_ai import Credentials
from app.core.config import settings

def make_watsonx_model() -> ModelInference:
    creds = Credentials(api_key=settings.WATSONX_API_KEY, url=settings.WATSONX_URL)
    params = {"max_tokens": settings.MAX_TOKENS, "temperature": settings.TEMPERATURE, "top_p": settings.TOP_P}
    return ModelInference(
        model_id=settings.WATSONX_MODEL_ID,
        credentials=creds,
        project_id=settings.WATSONX_PROJECT_ID,
        params=params,
    )

def chat_once(model: ModelInference, system: str, user: str) -> dict:
    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]
    return model.chat(messages=messages)