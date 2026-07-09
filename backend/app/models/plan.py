from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String

from app.models.base import Base


class Plan(Base):

    __tablename__ = "plans"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        unique=True,
        nullable=False
    )

    credits = Column(
        Integer,
        nullable=False
    )

    price_inr = Column(
        Integer,
        nullable=False
    )