import os, shutil, tempfile, pandas as pd, csv
from io import BytesIO
from fastapi import UploadFile, HTTPException
from pdf2image import convert_from_path
import pytesseract
import logging

MAX_PREVIEW_ROWS = 200

def df_to_preview(df: pd.DataFrame, max_rows: int = MAX_PREVIEW_ROWS) -> str:
    rows = min(len(df), max_rows)
    return df.head(rows).to_string(index=False)

def extract_text_from_upload(file: UploadFile) -> str:
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        name = (file.filename or "").lower()

        if name.endswith(".pdf"):
            images = convert_from_path(tmp_path)
            return "\n".join(pytesseract.image_to_string(img) for img in images)

        if name.endswith(".csv"):
            try:
                with open(tmp_path, newline="") as csvfile:
                    sample = csvfile.read(1024)
                    csvfile.seek(0)
                    try:
                        dialect = csv.Sniffer().sniff(sample)
                        delimiter = dialect.delimiter
                    except Exception:
                        delimiter = ","
                    df = pd.read_csv(tmp_path, delimiter=delimiter)
                    return df_to_preview(df)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"CSV parse error: {e}")

        if name.endswith(".xlsx"):
            try:
                df = pd.read_excel(tmp_path, engine="openpyxl")
                return df_to_preview(df)
            except Exception as e:
                logging.exception("Error reading .xlsx file")
                raise HTTPException(status_code=400, detail=f"Excel (.xlsx) parse error: {e}")

        if name.endswith(".xls"):
            try:
                df = pd.read_excel(tmp_path, engine="xlrd")
                return df_to_preview(df)
            except ImportError:
                raise HTTPException(status_code=400, detail="Missing dependency: xlrd is required to read .xls files.")
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Excel (.xls) parse error: {e}")

        raise HTTPException(status_code=400, detail="Unsupported file type. Please upload PDF, CSV, XLS, or XLSX.")
    finally:
        os.remove(tmp_path)