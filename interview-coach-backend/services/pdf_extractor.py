import pdfplumber
import io
from fastapi import UploadFile, HTTPException


async def extract_text_from_upload(file: UploadFile) -> str:
    """
    Accepts a FastAPI UploadFile (PDF), extracts and returns all text.
    Raises HTTPException with clear message on failure.
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail=f"Only PDF files are accepted. Got: {file.filename}"
        )

    contents = await file.read()

    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(contents) > 5 * 1024 * 1024:  # 5 MB limit
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 5MB."
        )

    try:
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            pages = []
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    pages.append(text.strip())

        full_text = "\n\n".join(pages)

        if not full_text.strip():
            raise HTTPException(
                status_code=422,
                detail="Could not extract text from this PDF. "
                       "It may be scanned or image-based."
            )

        return full_text

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"PDF processing failed: {str(e)}"
        )


def extract_text_from_bytes(file_bytes: bytes) -> str:
    """
    Synchronous version — accepts raw bytes, returns extracted text.
    Use this when you already have bytes (e.g. from S3 or disk).
    """
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            pages = []
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    pages.append(text.strip())

        full_text = "\n\n".join(pages)

        if not full_text.strip():
            raise ValueError(
                "No text found. PDF may be scanned or image-based."
            )

        return full_text

    except Exception as e:
        raise ValueError(f"PDF extraction failed: {str(e)}")