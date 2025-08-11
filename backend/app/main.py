from fastapi import FastAPI, UploadFile, File, Form, HTTPException, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ibm_watsonx_ai.foundation_models import ModelInference
from ibm_watsonx_ai import Credentials
from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams
import pytesseract
from PIL import Image
import tempfile, shutil, os
from pdf2image import convert_from_path
import pandas as pd
from dotenv import load_dotenv
from pydantic import BaseModel
import logging
import json


log = logging.getLogger("uvicorn.error")

class AnalyzeRequest(BaseModel):
    text: str

router = APIRouter()

load_dotenv()

app = FastAPI()

# Allow Next.js dev origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

IBM_API_KEY = os.getenv("WATSONX_API_KEY")
PROJECT_ID = os.getenv("WATSONX_PROJECT_ID")
IBM_ENDPOINT = "https://eu-gb.ml.cloud.ibm.com"

# Credentials + model client
creds = Credentials(api_key=IBM_API_KEY, url=IBM_ENDPOINT)

generate_params = {
    GenParams.MAX_NEW_TOKENS: 256,
    GenParams.TEMPERATURE: 0.2,
    GenParams.TOP_P: 0.9,
}

MODEL_ID = os.getenv("WATSONX_MODEL_ID")
granite_model = ModelInference(
    model_id=MODEL_ID,
    credentials=creds,
    params=generate_params,
    project_id=PROJECT_ID
)

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    text = ""
    try:
        filename = (file.filename or "").lower()

        if filename.endswith((".png", ".jpg", ".jpeg")):
            img = Image.open(tmp_path)
            text = pytesseract.image_to_string(img)

        elif filename.endswith(".pdf"):
            images = convert_from_path(tmp_path)
            text = "\n".join([pytesseract.image_to_string(img) for img in images])

        elif filename.endswith(".csv"):
            df = pd.read_csv(tmp_path)
            text = df.to_string(index=False)

        elif filename.endswith((".xls", ".xlsx")):
            df = pd.read_excel(tmp_path)
            text = df.to_string(index=False)

        else:
            raise HTTPException(status_code=400, detail="Unsupported file type.")
    finally:
        os.remove(tmp_path)

    return {"extracted_text": text[:2000]}

def clean_text(s: str) -> str:
    s = s.strip()
    # Remove leading punctuation-only characters (common: ., :, -, >)
    while s and s[0] in ".:->•*“”\"'` ":
        s = s[1:].lstrip()
    return s

@router.post("/analyze")
async def analyze(req: AnalyzeRequest):
    prompt = req.text.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Empty prompt")
    try:
        raw = call_watsonx(build_prompt(prompt))
        log.info("watsonx raw response: %s", json.dumps(raw, ensure_ascii=False) if isinstance(raw, (dict, list)) else str(raw))
        text = extract_text(raw)
        if not text:
            raise RuntimeError("Empty/unknown model payload")
        return {"result": clean_text(text)}
    except Exception as e:
        log.exception("Watsonx error")
        raise HTTPException(status_code=500, detail=f"Watsonx error: {str(e)}")
    
SYSTEM = (
  "You are a concise finance assistant. "
  "Answer clearly in bullet points. If unsure, say so."
)
def build_prompt(user_text: str) -> str:
    return f"{SYSTEM}\n\nUSER:\n{user_text}\n\nASSISTANT:"

def call_watsonx(prompt: str):
    """
    Calls IBM watsonx.ai using the global `granite_model` you initialized.
    Returns the raw SDK response (usually a dict).
    """
    # Typical SDKs: generate() or generate_text()
    # ModelInference.generate() commonly returns:
    # {"results": [{"generated_text": "..."}], "model_id": "...", ...}
    out = granite_model.generate(prompt=prompt)
    return out

def extract_text(raw):
    """
    Handles multiple possible response shapes.
    Return a single string or None.
    """
    if raw is None:
        return None
    # common shapes: {"results":[{"generated_text":"..."}]}
    if isinstance(raw, dict):
        if "results" in raw and isinstance(raw["results"], list) and raw["results"]:
            cand = raw["results"][0]
            if isinstance(cand, dict):
                for key in ("generated_text", "text", "output_text"):
                    if key in cand and isinstance(cand[key], str) and cand[key].strip():
                        return cand[key]
        # sometimes directly {"generated_text":"..."} / {"text":"..."}
        for key in ("generated_text", "text", "output_text"):
            if key in raw and isinstance(raw[key], str) and raw[key].strip():
                return raw[key]
        # some SDKs return {"model_output":"..."} or {"completions":[{"text":"..."}]}
        if "model_output" in raw and isinstance(raw["model_output"], str):
            return raw["model_output"]
        if "completions" in raw and raw["completions"]:
            c0 = raw["completions"][0]
            if isinstance(c0, dict) and "text" in c0:
                return c0["text"]
    # some SDKs return a plain string
    if isinstance(raw, str) and raw.strip():
        return raw.strip()
    return None

app.include_router(router)