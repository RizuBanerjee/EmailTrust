from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.database.db import get_db

from app.middleware.firebase_auth import (
    get_current_user
)

from app.services.user_sync_service import (
    get_or_create_user
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.get("/me")
def me(
    firebase_user=Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):

    user = get_or_create_user(
        db,
        firebase_user["email"]
    )

    return {
        "id": user.id,
        "email": user.email,
        "plan": user.plan,
        "credits_remaining": user.credits_remaining,
        "is_admin": user.is_admin
    }
