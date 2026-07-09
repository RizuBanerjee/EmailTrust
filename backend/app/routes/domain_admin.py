from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database.db import get_db

from app.schemas.admin_domain import DomainCreate, DomainImportRequest

from app.services.domain_admin_service import (
    add_domain,
    delete_domain,
    search_domains
)

from app.models.disposable_domain import (
    DisposableDomain
)

from app.middleware.admin_auth import (
    require_admin
)

router = APIRouter(
    prefix="/admin/domains",
    tags=["Admin Domains"]
)


@router.post("/")
def create_domain(
    request: DomainCreate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):

    domain = add_domain(
        db,
        request.domain
    )

    if not domain:
        raise HTTPException(
            status_code=400,
            detail="Domain already exists"
        )

    return {
        "message": "Domain added",
        "domain": request.domain
    }


@router.post("/import")
def import_domains_bulk(
    request: DomainImportRequest,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):

    inserted = 0
    skipped = 0

    for domain in request.domains:
        domain = domain.strip().lower()
        if not domain:
            continue

        exists = (
            db.query(DisposableDomain)
            .filter(DisposableDomain.domain == domain)
            .first()
        )

        if exists:
            skipped += 1
            continue

        db.add(DisposableDomain(domain=domain))
        inserted += 1

    db.commit()

    return {
        "inserted": inserted,
        "skipped": skipped,
    }


@router.delete("/{domain}")
def remove_domain(
    domain: str,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):

    success = delete_domain(
        db,
        domain
    )

    if not success:
        raise HTTPException(
            status_code=404,
            detail="Domain not found"
        )

    return {
        "message": "Domain deleted"
    }

@router.get("/search/{query}")
def search_domain(
    query: str,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):

    results = search_domains(
        db,
        query
    )

    return [
        domain.domain
        for domain in results
    ]

@router.get("/count")
def count_domains(
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):

    total = (
        db.query(
            DisposableDomain
        )
        .count()
    )

    return {
        "total_domains": total
    }