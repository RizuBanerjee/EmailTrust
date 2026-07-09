from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import DateTime
from sqlalchemy import func

from app.models.base import Base


class UsageLog(Base):
    __tablename__ = "usage_logs"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    api_key = Column(
        String,
        nullable=False
    )

    endpoint = Column(
        String,
        nullable=False
    )

    email_checked = Column(
        String,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )