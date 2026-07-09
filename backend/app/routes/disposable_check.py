from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database.db import get_db

from app.services.domain_service import (
    is_disposable_domain
)

router = APIRouter(
    prefix="/check-disposable",
    tags=["Disposable Email Check"]
)


@router.get("/{email}")
def check_disposable_email(
    email: str,
    db: Session = Depends(get_db)
):
    try:
        domain = email.split("@")[1].lower().strip()
    except IndexError:
        raise HTTPException(
            status_code=400,
            detail="Invalid email address"
        )

    disposable = is_disposable_domain(
        db,
        domain
    )

    return {
        "email": email,
        "domain": domain,
        "disposable": disposable
    }
