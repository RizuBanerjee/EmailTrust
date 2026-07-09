from sqlalchemy.orm import Session

from app.database.db import SessionLocal
from app.models.disposable_domain import DisposableDomain


DOMAINS = [
    "mail.tm",
    "guerrillamail.com",
    "10minutemail.com",
    "maildrop.cc",
    "tempmailo.com",
    "trashmail.com",
    "temp-mail.org",
    "yopmail.com",
    "fakeinbox.com"
]


def import_domains():

    db: Session = SessionLocal()

    try:

        for domain in DOMAINS:

            exists = (
                db.query(DisposableDomain)
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

        db.commit()

        print("Domains imported successfully")

    finally:
        db.close()


if __name__ == "__main__":
    import_domains()