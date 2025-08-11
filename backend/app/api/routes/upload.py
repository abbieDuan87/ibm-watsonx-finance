# app/api/routes/upload.py
from fastapi import APIRouter, UploadFile, File
from app.services.ocr import extract_text_from_upload

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    text = extract_text_from_upload(file)
    return {"extracted_text": text[:2000]}