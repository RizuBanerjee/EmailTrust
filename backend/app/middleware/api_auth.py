from fastapi import Depends, HTTPException
from fastapi.security import APIKeyHeader
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.services.api_key_service import get_api_key

api_key_header = APIKeyHeader(name="Authorization")


def validate_api_key(
    api_key: str = Depends(api_key_header),
    db: Session = Depends(get_db)
):
    key_record = get_api_key(db, api_key)

    if not key_record:
        raise HTTPException(
            status_code=401,
            detail="Invalid API key"
        )

    if key_record.requests_used >= key_record.requests_limit:
        raise HTTPException(
            status_code=403,
            detail="API limit exceeded"
        )

    return key_record