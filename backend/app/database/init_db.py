from sqlalchemy import text
from app.database.db import engine
from app.models import Base


def _add_is_admin_column_if_missing():
    """
    Ensure the `is_admin` column exists on the users table.
    This is needed for databases created before the column was added.
    """
    try:
        with engine.connect() as connection:
            connection.execute(
                text(
                    "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE NOT NULL"
                )
            )
            connection.commit()
    except Exception as e:
        # Log but do not fail startup. The app may still work if the
        # column already exists or the database dialect handles it differently.
        print(f"[init_db] Could not add is_admin column: {e}")


def _add_is_suspended_column_if_missing():
    try:
        with engine.connect() as connection:
            connection.execute(
                text(
                    "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE NOT NULL"
                )
            )
            connection.commit()
    except Exception as e:
        print(f"[init_db] Could not add is_suspended column: {e}")

def init_db():
    Base.metadata.create_all(bind=engine)
    _add_is_admin_column_if_missing()
    _add_is_suspended_column_if_missing()
