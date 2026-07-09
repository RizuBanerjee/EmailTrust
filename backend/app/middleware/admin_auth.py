from fastapi import Depends
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.middleware.firebase_auth import (
    get_current_user
)
from app.database.db import get_db
from app.services.user_service import (
    get_user_by_email
)


ADMIN_EMAILS = {
    "rizubanerjee456@gmail.com",
}


def require_admin(
    firebase_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    email = firebase_user.get("email")

    if not email:
        raise HTTPException(
            status_code=403,
            detail="Admin access requires a valid email"
        )

    user = get_user_by_email(
        db,
        email
    )

    if not user:
        raise HTTPException(
            status_code=403,
            detail="User not found"
        )

    if not user.is_admin and email not in ADMIN_EMAILS:
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return user
