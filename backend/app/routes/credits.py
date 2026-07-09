from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.database.db import get_db

from app.models.user import User

router = APIRouter(
    prefix="/credits",
    tags=["Credits"]
)


@router.get("/{email}")
def get_credits(
    email: str,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )

    if not user:

        return {
            "exists": False
        }

    return {
        "exists": True,
        "email": user.email,
        "plan": user.plan,
        "credits_remaining":
            user.credits_remaining
    }