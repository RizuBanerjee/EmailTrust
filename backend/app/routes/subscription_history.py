from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database.db import get_db

from app.services.user_service import (
    get_user_by_email
)

from app.services.subscription_service import (
    get_subscription_history
)

router = APIRouter(
    prefix="/subscription",
    tags=["Subscription"]
)


@router.get("/history/{email}")
def history(
    email: str,
    db: Session = Depends(get_db)
):

    user = get_user_by_email(
        db,
        email
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    history = get_subscription_history(
        db,
        user.id
    )

    return history