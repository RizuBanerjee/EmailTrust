from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.database.db import get_db

from app.models.disposable_domain import (
    DisposableDomain
)

router = APIRouter(
    prefix="/admin/import",
    tags=["Admin Import"]
)


@router.post("/sample")
def import_sample_domains(
    db: Session = Depends(get_db)
):

    domains = [
        "mail.tm",
        "guerrillamail.com",
        "10minutemail.com",
        "maildrop.cc",
        "trashmail.com",
        "tempmailo.com",
        "temp-mail.org",
        "fakeinbox.com",
        "spamgourmet.com",
        "throwawaymail.com",
        "mintemail.com",
        "mailinator.com",
        "dispostable.com",
        "sharklasers.com",
        "grr.la"
    ]

    inserted = 0

    for domain in domains:

        exists = (
            db.query(
                DisposableDomain
            )
            .filter(
                DisposableDomain.domain == domain
            )
            .first()
        )

        if not exists:

            db.add(
                DisposableDomain(
                    domain=domain
                )
            )

            inserted += 1

    db.commit()

    return {
        "inserted": inserted
    }