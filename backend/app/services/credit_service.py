from fastapi import HTTPException

from app.models.user import User


def get_user_by_id(
    db,
    user_id: str
):

    return (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )


def deduct_credits(
    db,
    user,
    amount: int = 1
):

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if user.credits_remaining < amount:

        raise HTTPException(
            status_code=403,
            detail="Insufficient credits"
        )

    user.credits_remaining -= amount

    db.commit()

    db.refresh(user)

    return user