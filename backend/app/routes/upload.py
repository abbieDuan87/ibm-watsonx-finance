from fastapi import APIRouter, UploadFile, File
from app.services.granite import process_file

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    result = process_file(content)
    return {"summary": result}