from fastapi import Request
from fastapi.responses import JSONResponse


class AppException(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail


class NotFound(AppException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(404, detail)


class AlreadyExists(AppException):
    def __init__(self, detail: str = "Resource already exists"):
        super().__init__(409, detail)


class Forbidden(AppException):
    def __init__(self, detail: str = "Not allowed"):
        super().__init__(403, detail)


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
