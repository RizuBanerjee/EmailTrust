from sqlalchemy.orm import Session

from app.models.disposable_domain import DisposableDomain


def is_disposable_domain(
    db: Session,
    domain: str
):
    result = (
        db.query(DisposableDomain)
        .filter(
            DisposableDomain.domain == domain
        )
        .first()
    )

    return result is not None