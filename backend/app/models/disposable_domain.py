from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String

from app.models.base import Base


class DisposableDomain(Base):
    __tablename__ = "disposable_domains"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    domain = Column(
        String,
        unique=True,
        nullable=False
    )