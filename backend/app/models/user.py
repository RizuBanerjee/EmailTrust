from sqlalchemy import (
    Column,
    String,
    Integer,
    Boolean,
    DateTime,
    func
)

from app.models.base import Base


class User(Base):

    __tablename__ = "users"

    id = Column(
        String,
        primary_key=True
    )

    email = Column(
        String,
        unique=True,
        nullable=False
    )

    plan = Column(
        String,
        default="FREE"
    )

    credits_remaining = Column(
        Integer,
        default=1000
    )

    is_admin = Column(
        Boolean,
        default=False,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    is_suspended = Column(
        Boolean,
        default=False,
        nullable=False
    )
