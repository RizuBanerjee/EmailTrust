from app.models.usage_log import UsageLog


def create_usage_log(
    db,
    api_key,
    endpoint,
    email_checked
):

    log = UsageLog(
        api_key=api_key,
        endpoint=endpoint,
        email_checked=email_checked
    )

    db.add(log)
    db.commit()

    return log

def get_user_usage_logs(
    db,
    api_key: str
):
    return (
        db.query(UsageLog)
        .filter(
            UsageLog.api_key == api_key
        )
        .order_by(
            UsageLog.created_at.desc()
        )
        .all()
    )