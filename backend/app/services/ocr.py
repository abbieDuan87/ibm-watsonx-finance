# app/services/ocr.py
import os, shutil, tempfile, pandas as pd
from fastapi import UploadFile, HTTPException
from PIL import Image
from pdf2image import convert_from_path
import pytesseract

def extract_text_from_upload(file: UploadFile) -> str:
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        name = (file.filename or "").lower()
        if name.endswith((".png", ".jpg", ".jpeg")):
            return pytesseract.image_to_string(Image.open(tmp_path))
        if name.endswith(".pdf"):
            images = convert_from_path(tmp_path)
            return "\n".join(pytesseract.image_to_string(img) for img in images)
        if name.endswith(".csv"):
            return pd.read_csv(tmp_path).to_string(index=False)
        if name.endswith((".xls", ".xlsx")):
            return pd.read_excel(tmp_path).to_string(index=False)
        raise HTTPException(status_code=400, detail="Unsupported file type.")
    finally:
        os.remove(tmp_path)