from pydantic import BaseModel, EmailStr
from datetime import datetime
from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserCreate(BaseModel):
    email: EmailStr


class UserResponse(BaseModel):
    id: str
    email: str
    plan: str
    is_admin: bool
    is_suspended: bool
    credits_remaining: int
    created_at: datetime

    class Config:
        from_attributes = True
