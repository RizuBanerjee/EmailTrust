from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.database.db import get_db

from app.services.usage_service import (
    get_user_usage_logs
)

router = APIRouter(
    prefix="/usage",
    tags=["Usage"]
)


@router.get("/{api_key}")
def usage_logs(
    api_key: str,
    db: Session = Depends(get_db)
):

    return get_user_usage_logs(
        db,
        api_key
    )