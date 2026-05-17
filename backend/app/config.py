from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5435/mama_budget"
    SECRET_KEY: str = "change-me-to-a-random-string"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 24
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
