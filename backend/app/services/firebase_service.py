import os
import json

import firebase_admin

from firebase_admin import (
    credentials,
    auth
)


# Initialize Firebase only once
if not firebase_admin._apps:

    firebase_config = {
        "type": "service_account",

        "project_id":
            os.getenv(
                "FIREBASE_PROJECT_ID"
            ),

        "private_key_id":
            os.getenv(
                "FIREBASE_PRIVATE_KEY_ID"
            ),

        "private_key":
            os.getenv(
                "FIREBASE_PRIVATE_KEY",
                ""
            ).replace("\\n", "\n"),

        "client_email":
            os.getenv(
                "FIREBASE_CLIENT_EMAIL"
            ),

        "client_id":
            os.getenv(
                "FIREBASE_CLIENT_ID"
            ),

        "auth_uri":
            "https://accounts.google.com/o/oauth2/auth",

        "token_uri":
            "https://oauth2.googleapis.com/token",

        "auth_provider_x509_cert_url":
            "https://www.googleapis.com/oauth2/v1/certs",

        "client_x509_cert_url":
            os.getenv(
                "FIREBASE_CLIENT_CERT_URL"
            )
    }


    cred = credentials.Certificate(
        firebase_config
    )

    firebase_admin.initialize_app(
        cred
    )


def verify_firebase_token(token: str):

    try:

        decoded_token = (
            auth.verify_id_token(
                token
            )
        )

        return decoded_token


    except Exception as e:

        print(
            "Firebase token error:",
            e
        )

        return None