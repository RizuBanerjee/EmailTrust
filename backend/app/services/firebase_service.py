import firebase_admin

from firebase_admin import (
    credentials,
    auth
)

SERVICE_ACCOUNT_FILE = "serviceAccountKey.json"

if not firebase_admin._apps:

    cred = credentials.Certificate(
        SERVICE_ACCOUNT_FILE
    )

    firebase_admin.initialize_app(
        cred
    )


def verify_firebase_token(
    token: str
):

    return auth.verify_id_token(
        token
    )