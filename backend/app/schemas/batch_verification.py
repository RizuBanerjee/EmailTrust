from pydantic import BaseModel, EmailStr
from typing import List, Dict, Any


class BatchVerificationRequest(BaseModel):
    emails: List[EmailStr]


class BatchVerificationItem(BaseModel):
    email: str
    domain: str
    provider: str
    is_temporary: bool
    trust_score: int
    risk_score: int
    recommendation: str
    checks: Dict[str, Any] = {}