from functools import lru_cache
from os import getenv

from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "Train With Me Cloud API"
    api_prefix: str = "/api"
    environment: str = "local"
    database_url: str = "postgresql+psycopg://train_with_me:train_with_me@postgres:5432/train_with_me"
    jwt_secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 60


@lru_cache
def get_settings() -> Settings:
    return Settings(
        app_name=getenv("TWM_APP_NAME", Settings.model_fields["app_name"].default),
        api_prefix=getenv("TWM_API_PREFIX", Settings.model_fields["api_prefix"].default),
        environment=getenv("TWM_ENVIRONMENT", Settings.model_fields["environment"].default),
        database_url=getenv("TWM_DATABASE_URL", Settings.model_fields["database_url"].default),
        jwt_secret_key=getenv("TWM_JWT_SECRET_KEY", Settings.model_fields["jwt_secret_key"].default),
        access_token_expire_minutes=int(
            getenv(
                "TWM_ACCESS_TOKEN_EXPIRE_MINUTES",
                str(Settings.model_fields["access_token_expire_minutes"].default),
            ),
        ),
    )
