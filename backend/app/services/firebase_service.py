import os

import firebase_admin

from firebase_admin import (
    credentials,
    auth
)


def initialize_firebase():

    if firebase_admin._apps:
        return


    firebase_config = {

        "type":
            "service_account",

        "project_id":
            os.getenv(
                "FIREBASE_PROJECT_ID"
            ),

        "private_key":
            os.getenv(
                "FIREBASE_PRIVATE_KEY"
            ).replace(
                "\\n",
                "\n"
            ),

        "client_email":
            os.getenv(
                "FIREBASE_CLIENT_EMAIL"
            ),

        "token_uri":
            "https://oauth2.googleapis.com/token"

    }


    cred = (
        credentials.Certificate(
            firebase_config
        )
    )


    firebase_admin.initialize_app(
        cred
    )


initialize_firebase()



def verify_token(
    token: str
):

    decoded_token = (
        auth.verify_id_token(
            token
        )
    )

    return decoded_token