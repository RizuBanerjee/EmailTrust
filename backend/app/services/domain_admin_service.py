from app.models.disposable_domain import DisposableDomain


def add_domain(
    db,
    domain: str
):

    existing = (
        db.query(DisposableDomain)
        .filter(
            DisposableDomain.domain == domain
        )
        .first()
    )

    if existing:
        return None

    new_domain = DisposableDomain(
        domain=domain
    )

    db.add(new_domain)
    db.commit()
    db.refresh(new_domain)

    return new_domain


def delete_domain(
    db,
    domain: str
):

    existing = (
        db.query(DisposableDomain)
        .filter(
            DisposableDomain.domain == domain
        )
        .first()
    )

    if not existing:
        return False

    db.delete(existing)
    db.commit()

    return True

def search_domains(
    db,
    query: str
):
    return (
        db.query(DisposableDomain)
        .filter(
            DisposableDomain.domain.ilike(
                f"%{query}%"
            )
        )
        .limit(50)
        .all()
    )