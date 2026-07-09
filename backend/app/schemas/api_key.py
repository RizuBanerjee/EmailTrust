from pydantic import BaseModel
from datetime import datetime


class ApiKeyResponse(BaseModel):
    id: str
    api_key: str
    requests_used: int
    requests_limit: int
    created_at: datetime

    class Config:
        from_attributes = True