from app.services.provider_service import (
    classify_provider
)

from app.services.domain_service import (
    is_disposable_domain
)

from app.services.scoring_service import (
    score_email
)


def verify_batch(
    db,
    emails
):

    results = []

    for email in emails:

        email = email.lower().strip()
        domain = email.split("@")[1]

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

        results.append(
            {
                "email": email,
                "domain": domain,
                "provider": provider_type,
                "is_temporary": temporary,
                "trust_score": scores["trust_score"],
                "risk_score": scores["risk_score"],
                "recommendation": scores["recommendation"],
                "checks": scores["checks"]
            }
        )

    return results