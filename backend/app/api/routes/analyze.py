# app/api/routes/analyze.py
from fastapi import APIRouter, Depends, HTTPException
from ibm_watsonx_ai.foundation_models import ModelInference
from app.api.deps import get_watsonx_model
from app.models.schemas import AnalyzeRequest, AnalyzeResponse
from app.services.watsonx import chat_once
from app.utils.text import SYSTEM_FINANCE, clean_text
import logging

router = APIRouter()
log = logging.getLogger("uvicorn.error")

def extract_text(raw: dict | str | None) -> str | None:
    if not raw:
        return None
    try:
        if isinstance(raw, dict):
            ch = raw.get("choices")
            if ch and ch[0] and "message" in ch[0]:
                content = ch[0]["message"].get("content")
                return content.strip() if isinstance(content, str) else None
    except Exception:
        pass
    if isinstance(raw, dict) and "results" in raw and raw["results"]:
        cand = raw["results"][0]
        for key in ("generated_text", "text", "output_text"):
            if isinstance(cand.get(key), str) and cand[key].strip():
                return cand[key].strip()
    if isinstance(raw, str) and raw.strip():
        return raw.strip()
    return None

@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest, model: ModelInference = Depends(get_watsonx_model)):
    prompt = req.text.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Empty prompt")
    try:
        raw = chat_once(model, SYSTEM_FINANCE, prompt)
        log.info("watsonx raw response: %s", str(raw))
        text = extract_text(raw)
        if not text:
            raise RuntimeError("Empty/unknown model payload")
        return AnalyzeResponse(result=clean_text(text))
    except Exception as e:
        log.exception("Watsonx error")
        raise HTTPException(status_code=500, detail=f"Watsonx error: {str(e)}")