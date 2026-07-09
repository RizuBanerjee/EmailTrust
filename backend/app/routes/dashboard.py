from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.database.db import get_db

from app.services.dashboard_service import (
    get_dashboard_data
)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get(
    "/overview/{email}"
)
def dashboard_overview(
    email: str,
    db: Session = Depends(get_db)
):

    return get_dashboard_data(
        db,
        email
    )