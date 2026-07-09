from pathlib import Path

from sqlalchemy.orm import Session

from app.database.db import SessionLocal
from app.models.disposable_domain import DisposableDomain


DATA_FILE = Path(
    "data/disposable_domains.txt"
)


def import_domains():

    if not DATA_FILE.exists():
        raise FileNotFoundError(
            f"{DATA_FILE} not found"
        )

    db: Session = SessionLocal()

    inserted = 0
    skipped = 0

    try:

        existing_domains = {
            row.domain
            for row in db.query(
                DisposableDomain.domain
            ).all()
        }

        with open(
            DATA_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            for line in file:

                domain = line.strip().lower()

                if not domain:
                    continue

                if domain in existing_domains:
                    skipped += 1
                    continue

                db.add(
                    DisposableDomain(
                        domain=domain
                    )
                )

                existing_domains.add(domain)
                inserted += 1

        db.commit()

        print(
            f"Inserted: {inserted}"
        )

        print(
            f"Skipped: {skipped}"
        )

    finally:
        db.close()


if __name__ == "__main__":
    import_domains()