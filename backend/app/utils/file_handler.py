import os
import shutil
from fastapi import UploadFile, HTTPException
from pathlib import Path
from app.utils.constants import SUPPORTED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def validate_image(file: UploadFile) -> bool:
    if file.content_type not in SUPPORTED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file format")
    return True

async def save_upload_file(upload_file: UploadFile, destination: Path) -> str:
    try:
        with destination.open("wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
        return str(destination)
    finally:
        upload_file.file.close()
