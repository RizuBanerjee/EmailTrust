from app.models.user import User
from app.models.api_key import ApiKey
from app.models.usage_log import UsageLog


def get_dashboard_data(
    db,
    email: str
):

    user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )

    if not user:
        return None

    api_keys = (
        db.query(ApiKey)
        .filter(
            ApiKey.user_id == user.id
        )
        .all()
    )

    total_requests = sum(
        key.requests_used
        for key in api_keys
    )

    return {
        "email": user.email,
        "plan": user.plan,
        "credits_remaining":
            user.credits_remaining,
        "api_keys":
            len(api_keys),
        "total_requests":
            total_requests
    }