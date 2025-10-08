"""
Configuration module for the bot.
Loads settings from environment variables using Pydantic Settings.
"""

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from pathlib import Path


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # ============================================
    # GREEN API (WhatsApp) Configuration
    # ============================================
    green_api_instance_id: str = Field(..., description="Green API Instance ID")
    green_api_token: str = Field(..., description="Green API Token")

    # ============================================
    # TELEGRAM Configuration
    # ============================================
    telegram_api_id: int = Field(..., description="Telegram API ID")
    telegram_api_hash: str = Field(..., description="Telegram API Hash")
    telegram_phone: str = Field(..., description="Telegram phone number")
    telegram_session_name: str = Field(
        default="userbot_session",
        description="Telegram session name"
    )

    # ============================================
    # DIRECTUS Configuration
    # ============================================
    directus_url: str = Field(
        default="http://localhost:8055",
        description="Directus URL"
    )
    directus_email: Optional[str] = Field(
        default=None,
        description="Directus email for authentication"
    )
    directus_password: Optional[str] = Field(
        default=None,
        description="Directus password for authentication"
    )
    directus_token: Optional[str] = Field(
        default=None,
        description="Directus static token (alternative to email/password)"
    )

    # ============================================
    # DEEPSEEK AI Configuration
    # ============================================
    deepseek_api_key: str = Field(..., description="DeepSeek API Key")
    deepseek_model: str = Field(
        default="deepseek-chat",
        description="DeepSeek model name"
    )
    deepseek_base_url: str = Field(
        default="https://api.deepseek.com",
        description="DeepSeek API base URL"
    )

    # ============================================
    # Application Settings
    # ============================================
    environment: str = Field(
        default="development",
        description="Environment: development, production"
    )
    log_level: str = Field(
        default="INFO",
        description="Logging level"
    )
    log_file: str = Field(
        default="logs/bot.log",
        description="Log file path"
    )
    debug_mode: bool = Field(
        default=False,
        description="Enable debug mode"
    )

    # ============================================
    # Bot Behavior Settings
    # ============================================
    ai_temperature: float = Field(
        default=0.7,
        ge=0.0,
        le=2.0,
        description="AI temperature (0.0 - 2.0)"
    )
    ai_max_tokens: int = Field(
        default=2000,
        gt=0,
        description="Max tokens for AI response"
    )
    whatsapp_enabled: bool = Field(
        default=True,
        description="Enable WhatsApp messenger"
    )
    telegram_enabled: bool = Field(
        default=True,
        description="Enable Telegram messenger"
    )
    auto_reply_enabled: bool = Field(
        default=True,
        description="Enable auto-reply"
    )
    auto_reply_delay_seconds: int = Field(
        default=2,
        ge=0,
        description="Delay before auto-reply (seconds)"
    )

    @field_validator("telegram_phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        """Validate phone number format."""
        if not v.startswith("+"):
            raise ValueError("Phone number must start with +")
        return v

    @field_validator("log_level")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        """Validate log level."""
        valid_levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        v_upper = v.upper()
        if v_upper not in valid_levels:
            raise ValueError(f"Log level must be one of {valid_levels}")
        return v_upper

    @property
    def sessions_dir(self) -> Path:
        """Get sessions directory path."""
        return Path(__file__).parent.parent / "sessions"

    @property
    def logs_dir(self) -> Path:
        """Get logs directory path."""
        return Path(__file__).parent.parent / "logs"

    def ensure_directories(self) -> None:
        """Ensure required directories exist."""
        self.sessions_dir.mkdir(parents=True, exist_ok=True)
        self.logs_dir.mkdir(parents=True, exist_ok=True)

    def get_telegram_session_path(self) -> str:
        """Get full path to Telegram session file."""
        return str(self.sessions_dir / self.telegram_session_name)

    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.environment.lower() == "production"

    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.environment.lower() == "development"


# Global settings instance
settings = Settings()

# Ensure directories exist
settings.ensure_directories()


# Export for easy import
__all__ = ["settings", "Settings"]
