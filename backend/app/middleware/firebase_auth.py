from fastapi import Depends
from fastapi import HTTPException
from fastapi.security import HTTPBearer

from app.services.firebase_service import (
    verify_firebase_token
)

security = HTTPBearer()


def get_current_user(
    credentials=Depends(security)
):

    try:

        decoded_token = verify_firebase_token(
            credentials.credentials
        )

        return decoded_token

    except Exception:

        raise HTTPException(
            status_code=401,
            detail="Invalid Firebase Token"
        )