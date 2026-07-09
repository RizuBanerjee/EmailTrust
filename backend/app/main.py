from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database.init_db import init_db

from app.routes.user import (
    router as user_router
)

from app.routes.api_key import (
    router as api_key_router
)

from app.routes.email_verification import (
    router as email_verification_router
)

from app.routes.analytics import (
    router as analytics_router
)

from app.routes.domain_admin import (
    router as domain_admin_router
)

from app.routes.batch_verification import (
    router as batch_router
)

from app.routes.credits import (
    router as credits_router
)

from app.routes.dashboard import (
    router as dashboard_router
)

from app.routes.subscription import (
    router as subscription_router
)

from app.routes.payment import (
    router as payment_router
)

from app.routes.auth import (
    router as auth_router
)

from app.routes.usage import (
    router as usage_router
)

from app.routes.subscription_history import (
    router as subscription_history_router
)

from app.routes.disposable_check import (
    router as disposable_check_router
)

from app.routes.admin import (
    router as admin_router
)

app = FastAPI(
    title="EmailTrust API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.on_event("startup")
def startup():
    init_db()

app.include_router(user_router)
app.include_router(api_key_router)
app.include_router(email_verification_router)
app.include_router(analytics_router)
app.include_router(domain_admin_router)
app.include_router(batch_router)
app.include_router(credits_router)
app.include_router(dashboard_router)
app.include_router(subscription_router)
app.include_router(subscription_history_router)
app.include_router(payment_router)
app.include_router(auth_router)
app.include_router(usage_router)
app.include_router(disposable_check_router)
app.include_router(admin_router)


@app.get("/")
def root():
    return {
        "status": "success",
        "message": "EmailTrust API is running"
    }

@app.exception_handler(Exception)
async def global_exception_handler(
    request,
    exc
):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": str(exc)
        }
    )
