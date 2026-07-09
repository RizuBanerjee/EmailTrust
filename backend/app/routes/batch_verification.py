from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from typing import List

from app.database.db import get_db

from app.middleware.api_auth import (
    validate_api_key
)

from app.schemas.batch_verification import (
    BatchVerificationRequest,
    BatchVerificationItem
)

from app.services.batch_verification_service import (
    verify_batch
)

from app.services.credit_service import (
    get_user_by_id,
    deduct_credits
)

from app.services.api_key_service import (
    increment_usage
)

router = APIRouter(
    prefix="/verify-batch",
    tags=["Batch Verification"]
)


@router.post(
    "/",
    response_model=List[BatchVerificationItem]
)
def verify_emails(
    request: BatchVerificationRequest,
    db: Session = Depends(get_db),
    api_key=Depends(validate_api_key)
):

    user = get_user_by_id(
        db,
        api_key.user_id
    )

    email_count = len(
        request.emails
    )

    deduct_credits(
        db,
        user,
        email_count
    )

    increment_usage(
        db,
        api_key
    )

    return verify_batch(
        db,
        request.emails
    )