import uuid
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.subscription import Subscription
from app.models.user import User
from app.services.plan_config import PLANS


# Local helper so this file does not depend on an external user-service helper.
def _get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def _commit(db: Session) -> None:
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise


def get_available_plans():
    return PLANS


def get_subscription(db: Session, email: str) -> Optional[User]:
    """Return the user record (current plan/credits are stored on the user)."""
    return _get_user_by_email(db, email)


def get_subscription_history(db: Session, user_id: str) -> List[Subscription]:
    return (
        db.query(Subscription)
        .filter(Subscription.user_id == user_id)
        .order_by(Subscription.created_at.desc())
        .all()
    )


def upgrade_user_plan(
    db: Session,
    email: str,
    plan_name: str,
    payment_id: Optional[str] = None,
):
    plan_name = plan_name.upper()

    if plan_name not in PLANS:
        raise ValueError("Invalid subscription plan.")

    user = _get_user_by_email(db, email)
    if not user:
        raise ValueError("User not found.")

    # Prevent accidental downgrades or re-purchases of the same plan.
    plan_order = {
        "FREE": 0,
        "STARTER": 1,
        "PRO": 2,
        "ENTERPRISE": 3,
    }
    if plan_name in plan_order and user.plan in plan_order:
        if plan_order[plan_name] <= plan_order[user.plan]:
            raise ValueError(
                "Please select a plan higher than your current subscription."
            )

    plan = PLANS[plan_name]

    # Update current plan/credits on the user row.
    user.plan = plan_name
    user.credits_remaining = plan["credits"]

    # Record the payment / history row using the existing subscriptions table.
    subscription = Subscription(
        id=str(uuid.uuid4()),
        user_id=user.id,
        plan_name=plan_name,
        status="ACTIVE",
        credits_granted=plan["credits"],
        amount_paid=plan["price"],
        payment_id=payment_id or "manual_upgrade",
    )

    db.add(subscription)
    _commit(db)
    db.refresh(user)

    return {
        "success": True,
        "message": "Subscription upgraded successfully.",
        "email": user.email,
        "plan": user.plan,
        "credits_remaining": user.credits_remaining,
    }


def renew_subscription(
    db: Session,
    email: str,
    payment_id: Optional[str] = None,
):
    user = _get_user_by_email(db, email)
    if not user:
        raise ValueError("User not found.")

    plan_name = user.plan
    if plan_name not in PLANS:
        plan_name = "FREE"

    plan = PLANS[plan_name]

    # Refresh credits on the user row.
    user.credits_remaining = plan["credits"]

    # Record the renewal in the existing subscriptions table.
    subscription = Subscription(
        id=str(uuid.uuid4()),
        user_id=user.id,
        plan_name=plan_name,
        status="ACTIVE",
        credits_granted=plan["credits"],
        amount_paid=plan["price"],
        payment_id=payment_id or "manual_renewal",
    )

    db.add(subscription)
    _commit(db)
    db.refresh(user)

    return {
        "success": True,
        "message": "Subscription renewed.",
        "credits_remaining": user.credits_remaining,
    }


def cancel_subscription(db: Session, email: str):
    user = _get_user_by_email(db, email)
    if not user:
        raise ValueError("User not found.")

    user.plan = "FREE"
    user.credits_remaining = PLANS["FREE"]["credits"]

    # Mark the most recent active subscription row as cancelled.
    active_subscription = (
        db.query(Subscription)
        .filter(
            Subscription.user_id == user.id,
            Subscription.status == "ACTIVE",
        )
        .order_by(Subscription.created_at.desc())
        .first()
    )
    if active_subscription:
        active_subscription.status = "CANCELLED"

    _commit(db)
    db.refresh(user)

    return {
        "success": True,
        "message": "Subscription cancelled.",
        "plan": user.plan,
        "credits_remaining": user.credits_remaining,
    }