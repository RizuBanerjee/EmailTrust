from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database.db import get_db
from app.services.razorpay_service import client
from app.services.plan_config import PLANS
from app.services.subscription_service import upgrade_user_plan
import hmac
import hashlib

router = APIRouter(prefix="/payment", tags=["Payment"])

class CreateOrderRequest(BaseModel):
    plan: str
    email: str

class VerifyRequest(BaseModel):
    email: str
    plan: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

@router.post("/create-order")
def create_order(body: CreateOrderRequest, db: Session = Depends(get_db)):
    plan = body.plan.upper()
    email = body.email

    if plan not in PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan")

    amount = int(PLANS[plan]["price"]) * 100  # Razorpay uses paise

    order = client.order.create({
        "amount": amount,
        "currency": "INR",
        "receipt": f"{email}_{plan}",
        "notes": {
            "email": email,
            "plan": plan
        }
    })

    return {
        "order_id": order["id"],
        "amount": amount,
        "currency": "INR",
        "key_id": client.auth[0]
    }

@router.post("/verify")
def verify_payment(body: VerifyRequest, db: Session = Depends(get_db)):
    secret = client.auth[1]
    message = f"{body.razorpay_order_id}|{body.razorpay_payment_id}"
    generated_signature = hmac.new(
        secret.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(generated_signature, body.razorpay_signature):
        raise HTTPException(status_code=400, detail="Payment verification failed")

    return upgrade_user_plan(
        db,
        body.email,
        body.plan,
        payment_id=body.razorpay_payment_id
    )