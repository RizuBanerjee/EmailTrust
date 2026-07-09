from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import func
import uuid

from app.database.db import get_db
from app.middleware.admin_auth import require_admin
from app.models.user import User
from app.models.subscription import Subscription

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/overview")
def admin_overview(db: Session = Depends(get_db), admin=Depends(require_admin)):
    total_users = db.query(User).count()
    total_payments = db.query(Subscription).count()
    total_revenue = db.query(func.coalesce(func.sum(Subscription.amount_paid), 0)).scalar() or 0
    return {
        "totalUsers": total_users,
        "totalPayments": total_payments,
        "totalRevenue": total_revenue,
    }


@router.get("/users")
def admin_users(db: Session = Depends(get_db), admin=Depends(require_admin)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return {"users": users}


@router.delete("/users/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db), admin=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.query(Subscription).filter(Subscription.user_id == user_id).delete()
    db.delete(user)
    db.commit()
    return {"deleted": user}


@router.post("/users/{user_id}/credits")
def grant_credits(
    user_id: str,
    credits: int = Body(..., embed=True, gt=0),
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.credits_remaining += credits
    db.commit()
    db.refresh(user)
    return {"user": user}


@router.post("/users/{user_id}/suspend")
def toggle_suspend(
    user_id: str,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_suspended = not user.is_suspended
    db.commit()
    db.refresh(user)
    return {"user": user}


@router.get("/revenue")
def admin_revenue(db: Session = Depends(get_db), admin=Depends(require_admin)):
    total_revenue = db.query(func.coalesce(func.sum(Subscription.amount_paid), 0)).scalar() or 0
    total_payments = db.query(Subscription).count()
    avg = (total_revenue / total_payments) if total_payments else 0

    # Group by month in Python so this works on SQLite, Postgres, etc.
    subs = db.query(Subscription).order_by(Subscription.created_at.desc()).all()
    monthly = {}
    for s in subs:
        if s.created_at:
            month = s.created_at.strftime("%Y-%m")
            monthly[month] = monthly.get(month, {"payments": 0, "revenue": 0})
            monthly[month]["payments"] += 1
            monthly[month]["revenue"] += s.amount_paid or 0

    by_month = [
        {"month": m, "payments": v["payments"], "revenue": v["revenue"]}
        for m, v in sorted(monthly.items())
    ]

    recent = (
        db.query(Subscription, User.email)
        .join(User, Subscription.user_id == User.id)
        .order_by(Subscription.created_at.desc())
        .limit(10)
        .all()
    )

    return {
        "totalRevenue": total_revenue,
        "totalPayments": total_payments,
        "averageOrderValue": avg,
        "byMonth": by_month,
        "recentPayments": [
            {
                "id": s.id,
                "userId": s.user_id,
                "userEmail": email,
                "amount": s.amount_paid,
                "status": s.status,
                "createdAt": s.created_at,
            }
            for s, email in recent
        ],
    }


@router.post("/seed")
def seed_admin_data(db: Session = Depends(get_db), admin=Depends(require_admin)):
    if db.query(User).count() > 1:
        return {"message": "Users already exist; seed skipped."}

    now = datetime.now(timezone.utc)

    demo_users = [
        User(
            id=str(uuid.uuid4()),
            email="rizubanerjee456@gmail.com",
            plan="ENTERPRISE",
            credits_remaining=10000,
            is_admin=True,
        ),
        User(
            id=str(uuid.uuid4()),
            email="user1@example.com",
            plan="PRO",
            credits_remaining=1000,
        ),
        User(
            id=str(uuid.uuid4()),
            email="user2@example.com",
            plan="STARTER",
            credits_remaining=250,
        ),
        User(
            id=str(uuid.uuid4()),
            email="user3@example.com",
            plan="FREE",
            credits_remaining=0,
        ),
    ]

    db.add_all(demo_users)
    db.commit()

    plan_prices = {"STARTER": 299, "PRO": 999, "ENTERPRISE": 4999}
    payments = []
    for u in demo_users:
        price = plan_prices.get(u.plan, 0)
        if price > 0:
            for i in range(2):
                payments.append(
                    Subscription(
                        id=str(uuid.uuid4()),
                        user_id=u.id,
                        plan_name=u.plan,
                        status="ACTIVE",
                        credits_granted=u.credits_remaining,
                        amount_paid=price,
                        payment_id=f"pay_seed_{u.email}_{i}",
                        created_at=now - timedelta(days=i * 30),
                    )
                )

    db.add_all(payments)
    db.commit()

    return {"message": "Seed data created", "users": len(demo_users), "payments": len(payments)}