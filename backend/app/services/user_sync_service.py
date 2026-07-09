import uuid

from app.models.user import User


ADMIN_EMAILS = {
    "rizubanerjee456@gmail.com",
}


def get_or_create_user(
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

    is_admin_email = email in ADMIN_EMAILS

    if user:
        # Promote existing users that match the admin email list
        if is_admin_email and not user.is_admin:
            user.is_admin = True
            db.commit()
            db.refresh(user)
        return user

    user = User(
        id=str(uuid.uuid4()),
        email=email,
        plan="FREE",
        credits_remaining=1000,
        is_admin=is_admin_email
    )

    db.add(user)

    db.commit()

    db.refresh(user)

    return user
