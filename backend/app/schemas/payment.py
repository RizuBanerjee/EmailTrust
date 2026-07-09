from pydantic import BaseModel


class CreateOrderRequest(BaseModel):
    plan: str