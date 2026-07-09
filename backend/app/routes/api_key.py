from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database.db import get_db

from app.schemas.api_key import ApiKeyResponse

from app.services.user_service import (
    get_user_by_id
)

from app.services.api_key_service import (
    create_api_key
)

from app.services.api_key_service import (
    get_user_api_keys,
    delete_api_key,
    regenerate_api_key
)


router = APIRouter(
    prefix="/api-keys",
    tags=["API Keys"]
)


@router.post(
    "/{user_id}",
    response_model=ApiKeyResponse
)
def create_user_api_key(
    user_id: str,
    db: Session = Depends(get_db)
):
    user = get_user_by_id(
        db,
        user_id
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return create_api_key(
        db,
        user_id
    )

@router.get("/user/{user_id}")
def list_api_keys(
    user_id: str,
    db: Session = Depends(get_db)
):
    return get_user_api_keys(
        db,
        user_id
    )

@router.delete("/{key_id}")
def delete_key(
    key_id: str,
    db: Session = Depends(get_db)
):
    success = delete_api_key(
        db,
        key_id
    )

    return {
        "success": success
    }

@router.post("/regenerate/{key_id}")
def regenerate_key(
    key_id: str,
    db: Session = Depends(get_db)
):
    return regenerate_api_key(
        db,
        key_id
    )