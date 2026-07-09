from pydantic import BaseModel, EmailStr
from typing import Dict, Any


class EmailVerificationRequest(BaseModel):
    email: EmailStr


class EmailVerificationResponse(BaseModel):
    email: str
    domain: str
    provider: str
    is_temporary: bool
    trust_score: int
    risk_score: int
    recommendation: str
    checks: Dict[str, Any] = {}