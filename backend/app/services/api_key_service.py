import uuid
import secrets

from app.models.api_key import ApiKey


def generate_api_key():

    return (
        "et_live_"
        + secrets.token_urlsafe(32)
    )


def create_api_key(
    db,
    user_id: str
):

    key_record = ApiKey(
        id=str(uuid.uuid4()),
        user_id=user_id,
        api_key=generate_api_key(),
        requests_used=0,
        requests_limit=1000
    )

    db.add(key_record)

    db.commit()

    db.refresh(key_record)

    return key_record


def get_api_key(
    db,
    api_key: str
):

    return (
        db.query(ApiKey)
        .filter(
            ApiKey.api_key == api_key
        )
        .first()
    )


def increment_usage(
    db,
    api_key_record
):

    api_key_record.requests_used += 1

    db.commit()

    db.refresh(api_key_record)

    return api_key_record

def get_user_api_keys(
    db,
    user_id: str
):
    return (
        db.query(ApiKey)
        .filter(
            ApiKey.user_id == user_id
        )
        .all()
    )


def delete_api_key(
    db,
    key_id: str
):
    key = (
        db.query(ApiKey)
        .filter(
            ApiKey.id == key_id
        )
        .first()
    )

    if not key:
        return False

    db.delete(key)
    db.commit()

    return True


def regenerate_api_key(
    db,
    key_id: str
):
    key = (
        db.query(ApiKey)
        .filter(
            ApiKey.id == key_id
        )
        .first()
    )

    if not key:
        return None

    key.api_key = generate_api_key()

    db.commit()

    db.refresh(key)

    return key

def get_user_api_keys(
    db,
    user_id: str
):
    return (
        db.query(ApiKey)
        .filter(
            ApiKey.user_id == user_id
        )
        .all()
    )