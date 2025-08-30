from dotenv import find_dotenv, load_dotenv
from pydantic.v1 import BaseSettings

load_dotenv(find_dotenv(".env"))


class Settings(BaseSettings):
    # JWT Settings
    JWT_SECRET: str = "your-secret-key"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION: int = 3600  # 1 hour

    # Database Settings
    USER_DATABASE_URL: str = "user_sentry.db"
    DOC_DATABASE_URL: str = "doc_sentry.db"

    # Embedding Model
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # Security Settings
    SIMILARITY_THRESHOLD: float = 0.3
    MAX_CHUNKS_PER_QUERY: int = 5

    # PII Detection
    PII_DETECTION_ENABLED: bool = True

    class Config:
        env_file = ".env"


settings = Settings()
