from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "ServiceFlow AI"
    app_version: str = "1.0.0"
    google_cloud_project: str = "serviceflow-demo"
    vertex_ai_location: str = "us-central1"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"
    antigravity_endpoint: str = "https://cloudcode-pa.googleapis.com"
    google_maps_api_key: str = ""
    use_mock_gcp: bool = True
    cors_origins: str = "http://localhost:3000"
    data_dir: str = "data"

    class Config:
        env_file = ".env"
        extra = "ignore"


def get_settings() -> Settings:
    return Settings()
