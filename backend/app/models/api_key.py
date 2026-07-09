from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Integer
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import func

from app.models.base import Base


class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(
        String,
        primary_key=True
    )

    user_id = Column(
        String,
        ForeignKey("users.id"),
        nullable=False
    )

    api_key = Column(
        String,
        unique=True,
        nullable=False
    )

    requests_used = Column(
        Integer,
        default=0
    )

    requests_limit = Column(
        Integer,
        default=500
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )