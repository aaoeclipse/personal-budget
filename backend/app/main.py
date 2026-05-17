from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.exceptions import AppException, app_exception_handler
from app.routers import auth, budgets, categories, dashboard, expenses


def create_app() -> FastAPI:
    application = FastAPI(title="Mama Budget API", version="1.0.0")

    application.add_middleware(
        CORSMiddleware,
        allow_origins=[o.strip() for o in settings.ALLOWED_ORIGINS.split(",")],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.add_exception_handler(AppException, app_exception_handler)

    application.include_router(auth.router)
    application.include_router(budgets.router)
    application.include_router(categories.router)
    application.include_router(expenses.router)
    application.include_router(dashboard.router)

    @application.get("/health")
    def health() -> dict:
        return {"status": "ok"}

    return application


app = create_app()
