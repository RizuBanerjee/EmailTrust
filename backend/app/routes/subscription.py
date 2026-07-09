from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database.db import get_db

from app.schemas.subscription import (
    SubscriptionUpgradeRequest,
    SubscriptionResponse
)

from app.services.subscription_service import (
    get_subscription,
    get_available_plans,
    upgrade_user_plan,
    renew_subscription,
    cancel_subscription
)

router = APIRouter(
    prefix="/subscription",
    tags=["Subscription"]
)


@router.get("/plans")
def available_plans():

    return get_available_plans()


@router.get(
    "/{email}",
    response_model=SubscriptionResponse
)
def current_subscription(
    email: str,
    db: Session = Depends(get_db)
):

    user = get_subscription(
        db,
        email
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "email": user.email,
        "plan": user.plan,
        "credits_remaining": user.credits_remaining
    }


@router.post("/upgrade")
def upgrade_subscription(
    request: SubscriptionUpgradeRequest,
    db: Session = Depends(get_db)
):

    try:

        return upgrade_user_plan(
            db,
            request.email,
            request.plan
        )

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.post("/renew")
def renew(
    email: str,
    db: Session = Depends(get_db)
):

    try:

        return renew_subscription(
            db,
            email
        )

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.post("/cancel")
def cancel(
    email: str,
    db: Session = Depends(get_db)
):

    try:

        return cancel_subscription(
            db,
            email
        )

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )