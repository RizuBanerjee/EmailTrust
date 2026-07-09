from pydantic import BaseModel


class SubscriptionUpgradeRequest(BaseModel):
    email: str
    plan: str


class SubscriptionResponse(BaseModel):
    email: str
    plan: str
    credits_remaining: int