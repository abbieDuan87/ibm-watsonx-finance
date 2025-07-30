from fastapi import FastAPI, UploadFile, File, Form
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

IBM_API_KEY = os.getenv("WATSONX_API_KEY")
PROJECT_ID = os.getenv("WATSONX_PROJECT_ID")
IBM_ENDPOINT = "https://eu-gb.ml.cloud.ibm.com"

# Build credentials object
creds = Credentials(api_key=IBM_API_KEY, url=IBM_ENDPOINT)

# Optional generation params
generate_params = {
    GenParams.MAX_NEW_TOKENS: 300,
    GenParams.TEMPERATURE: 0.7,
    GenParams.DECODING_METHOD: "greedy"
}

# Create Granite inference client
granite_model = ModelInference(
    model_id="ibm/granite-3-8b-instruct",
    credentials=creds,
    params=generate_params,
    project_id=PROJECT_ID
)


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    text = ""
    try:
        filename = file.filename or ""
        if filename.lower().endswith((".png", ".jpg", ".jpeg")):
            img = Image.open(tmp_path)
            text = pytesseract.image_to_string(img)
        elif filename.lower().endswith(".pdf"):
            images = convert_from_path(tmp_path)
            text = "\n".join([pytesseract.image_to_string(img) for img in images])
        elif filename.lower().endswith(".csv"):
            df = pd.read_csv(tmp_path)
            text = df.to_string(index=False)
        elif filename.lower().endswith((".xls", ".xlsx")):
            df = pd.read_excel(tmp_path)
            text = df.to_string(index=False)
        else:
            return {"error": "Unsupported file type."}
    finally:
        os.remove(tmp_path)

    return {"extracted_text": text[:2000]}  # preview


@app.post("/analyze")
async def analyze_report(text: str = Form(...)):
    prompt = f"""
    Here is a financial report:\n\n{text}\n\n
    Please provide clear financial insights for a small restaurant business.
    """
    result = granite_model.generate_text(prompt=prompt)
    return {"insight": result}