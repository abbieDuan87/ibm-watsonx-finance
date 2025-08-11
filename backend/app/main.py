from fastapi import FastAPI, UploadFile, File, Form, HTTPException
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
    GenParams.MAX_NEW_TOKENS: 512,
    GenParams.TEMPERATURE: 0.3,
    GenParams.DECODING_METHOD: "greedy"
}

MODEL_ID = os.getenv("WATSONX_MODEL_ID", "ibm/granite-13b-instruct-v2")
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

@app.post("/analyze")
async def analyze_report(text: str = Form(...)):
    prompt = (
        "You are a financial analyst for small restaurants.\n"
        "Given the following income statement or financial text, produce:\n"
        "1) concise summary, 2) key metrics (revenue, COGS, gross margin, net income), "
        "3) month-over-month trends, 4) 2–3 actionable suggestions.\n\n"
        f"=== DATA START ===\n{text}\n=== DATA END ==="
    )
    try:
        result = granite_model.generate_text(prompt=prompt)
        if isinstance(result, dict):
            insight = (result.get("results") or [{}])[0].get("generated_text")
        else:
            insight = result
        if not insight:
            raise ValueError(f"Unexpected model response: {result}")
        return {"insight": insight}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Watsonx error: {e}")