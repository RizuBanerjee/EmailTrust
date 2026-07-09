from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.database.db import get_db

from app.schemas.email_verification import (
    EmailVerificationRequest,
    EmailVerificationResponse
)

from app.services.domain_service import (
    is_disposable_domain
)

from app.services.api_key_service import (
    increment_usage
)

from app.services.usage_service import (
    create_usage_log
)

from app.middleware.api_auth import (
    validate_api_key
)

from app.services.provider_service import (
    classify_provider
)

from app.services.credit_service import (
    get_user_by_id,
    deduct_credits
)

from app.services.scoring_service import (
    score_email
)

router = APIRouter(
    prefix="/verify-email",
    tags=["Email Verification"]
)


@router.post(
    "/",
    response_model=EmailVerificationResponse
)
def verify_email(
    request: EmailVerificationRequest,
    db: Session = Depends(get_db),
    key_record=Depends(validate_api_key)
):

    user = get_user_by_id(
        db,
        key_record.user_id
    )

    deduct_credits(
        db,
        user,
        1
    )

    email = request.email.lower().strip()
    domain = email.split("@")[1]

    increment_usage(
        db,
        key_record
    )

    create_usage_log(
        db=db,
        api_key=key_record.api_key,
        endpoint="/verify-email",
        email_checked=email
    )

    temporary = is_disposable_domain(
        db,
        domain
    )

    provider_type = classify_provider(
        domain,
        temporary
    )

    scores = score_email(
        email,
        domain,
        temporary
    )

    return {
        "email": email,
        "domain": domain,
        "provider": provider_type,
        "is_temporary": temporary,
        "trust_score": scores["trust_score"],
        "risk_score": scores["risk_score"],
        "recommendation": scores["recommendation"],
        "checks": scores["checks"]
    }