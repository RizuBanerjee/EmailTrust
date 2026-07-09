from sqlalchemy import (
    Column,
    String,
    Integer,
    DateTime,
    ForeignKey,
    func
)

from app.models.base import Base


class Subscription(Base):
    """Subscription history / transaction log. One row per payment or change."""

    __tablename__ = "subscriptions"

    id = Column(
        String,
        primary_key=True
    )

    user_id = Column(
        String,
        ForeignKey("users.id"),
        nullable=False
    )

    plan_name = Column(
        String,
        nullable=False
    )

    status = Column(
        String,
        default="ACTIVE"
    )

    amount_paid = Column(
        Integer,
        default=0
    )

    credits_granted = Column(
        Integer,
        default=0
    )

    payment_id = Column(
        String,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )