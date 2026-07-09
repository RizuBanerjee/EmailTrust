from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database.db import get_db

from app.middleware.firebase_auth import (
    get_current_user
)
from app.middleware.admin_auth import (
    require_admin
)
from app.services.user_service import (
    get_user_by_email
)
from app.services.analytics_service import (
    get_total_requests,
    get_total_api_keys,
    get_top_checked_domains,
    get_user_total_requests,
    get_user_total_api_keys,
    get_user_top_checked_domains
)

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get("/overview")
def analytics_overview(
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    return {
        "total_requests":
            get_total_requests(db),

        "total_api_keys":
            get_total_api_keys(db),

        "top_domains":
            get_top_checked_domains(db)
    }


@router.get("/user/{email}")
def analytics_user(
    email: str,
    db: Session = Depends(get_db),
    firebase_user=Depends(get_current_user)
):
    requester_email = firebase_user.get("email")

    if not requester_email:
        raise HTTPException(
            status_code=401,
            detail="Email not available in token"
        )

    # Admins can view any user's analytics; users can only view their own
    if requester_email != email:
        requester = get_user_by_email(db, requester_email)
        if not requester or not requester.is_admin:
            raise HTTPException(
                status_code=403,
                detail="You can only view your own analytics"
            )

    user = get_user_by_email(db, email)

    if not user:
        return {
            "total_requests": 0,
            "total_api_keys": 0,
            "top_domains": []
        }

    return {
        "total_requests":
            get_user_total_requests(db, user.id),

        "total_api_keys":
            get_user_total_api_keys(db, user.id),

        "top_domains":
            get_user_top_checked_domains(db, user.id)
    }
