from functools import lru_cache
from os import getenv

from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "Train With Me Cloud API"
    api_prefix: str = "/api"
    environment: str = "local"


@lru_cache
def get_settings() -> Settings:
    return Settings(
        app_name=getenv("TWM_APP_NAME", Settings.model_fields["app_name"].default),
        api_prefix=getenv("TWM_API_PREFIX", Settings.model_fields["api_prefix"].default),
        environment=getenv("TWM_ENVIRONMENT", Settings.model_fields["environment"].default),
    )
