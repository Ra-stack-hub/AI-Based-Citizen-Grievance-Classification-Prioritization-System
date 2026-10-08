from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart City Citizen Grievance System"
    API_V1_STR: str = "/api/v1"
    
    # MongoDB settings (can be overridden by .env)
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "smart_city_grievance"
    
    # JWT Auth settings
    SECRET_KEY: str = "YOUR_SUPER_SECRET_KEY_HERE_CHANGE_IN_PRODUCTION"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    class Config:
        env_file = ".env"

settings = Settings()
