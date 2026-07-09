from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database.db import get_db
from app.schemas.user import UserCreate
from app.schemas.user import UserResponse

from app.services.user_service import (
    create_user,
    get_user_by_email
)

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.post(
    "/",
    response_model=UserResponse
)
def create_new_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = get_user_by_email(
        db,
        user.email
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    return create_user(
        db,
        user.email
    )