from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.usage_log import UsageLog
from app.models.api_key import ApiKey


def get_total_requests(db: Session):
    total = db.query(
        func.count(UsageLog.id)
    ).scalar()

    return total or 0


def get_total_api_keys(db: Session):
    total = db.query(
        func.count(ApiKey.id)
    ).scalar()

    return total or 0


def get_top_checked_domains(db: Session):

    results = (
        db.query(
            UsageLog.email_checked,
            func.count(
                UsageLog.id
            ).label("count")
        )
        .group_by(
            UsageLog.email_checked
        )
        .order_by(
            func.count(
                UsageLog.id
            ).desc()
        )
        .limit(10)
        .all()
    )

    return [
        {
            "email": row.email_checked,
            "count": row.count
        }
        for row in results
    ]


# User-scoped analytics

def _get_user_api_keys(
    db: Session,
    user_id: str
):
    return (
        db.query(
            ApiKey.api_key
        )
        .filter(
            ApiKey.user_id == user_id
        )
        .all()
    )


def get_user_total_requests(
    db: Session,
    user_id: str
):
    api_keys = _get_user_api_keys(
        db,
        user_id
    )

    if not api_keys:
        return 0

    key_values = [row.api_key for row in api_keys]

    total = (
        db.query(
            func.count(UsageLog.id)
        )
        .filter(
            UsageLog.api_key.in_(key_values)
        )
        .scalar()
    )

    return total or 0


def get_user_total_api_keys(
    db: Session,
    user_id: str
):
    total = (
        db.query(
            func.count(ApiKey.id)
        )
        .filter(
            ApiKey.user_id == user_id
        )
        .scalar()
    )

    return total or 0


def get_user_top_checked_domains(
    db: Session,
    user_id: str
):
    api_keys = _get_user_api_keys(
        db,
        user_id
    )

    if not api_keys:
        return []

    key_values = [row.api_key for row in api_keys]

    results = (
        db.query(
            UsageLog.email_checked,
            func.count(
                UsageLog.id
            ).label("count")
        )
        .filter(
            UsageLog.api_key.in_(key_values)
        )
        .group_by(
            UsageLog.email_checked
        )
        .order_by(
            func.count(
                UsageLog.id
            ).desc()
        )
        .limit(10)
        .all()
    )

    return [
        {
            "email": row.email_checked,
            "count": row.count
        }
        for row in results
    ]
