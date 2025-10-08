"""
Main entry point for the bot.
"""

import asyncio
import signal
from typing import List, Optional
from .config import settings
from .utils.logger import setup_logger, logger
from .integrations.directus import DirectusClient
from .integrations.ai import DeepSeekClient
from .core.message_processor import MessageProcessor
from .whatsapp.bot import WhatsAppBot
from .telegram.bot import TelegramBot


class BotOrchestrator:
    """Orchestrates multiple messenger bots."""

    def __init__(self):
        """Initialize bot orchestrator."""
        self.directus: Optional[DirectusClient] = None
        self.ai: Optional[DeepSeekClient] = None
        self.processor: Optional[MessageProcessor] = None
        self.whatsapp_bot: Optional[WhatsAppBot] = None
        self.telegram_bot: Optional[TelegramBot] = None
        self.tasks: List[asyncio.Task] = []

    async def initialize(self) -> None:
        """Initialize all components."""
        logger.info("Initializing bot components...")

        # Initialize Directus client
        self.directus = DirectusClient(
            url=settings.directus_url,
            email=settings.directus_email,
            password=settings.directus_password,
            token=settings.directus_token
        )

        # Authenticate with Directus
        if not await self.directus.authenticate():
            raise Exception("Failed to authenticate with Directus")

        # Initialize AI client
        self.ai = DeepSeekClient(
            api_key=settings.deepseek_api_key,
            model=settings.deepseek_model,
            base_url=settings.deepseek_base_url,
            temperature=settings.ai_temperature,
            max_tokens=settings.ai_max_tokens
        )

        # Initialize message processor
        self.processor = MessageProcessor(
            directus_client=self.directus,
            ai_client=self.ai,
            auto_reply_delay=settings.auto_reply_delay_seconds
        )

        # Initialize WhatsApp bot if enabled
        if settings.whatsapp_enabled:
            self.whatsapp_bot = WhatsAppBot(
                instance_id=settings.green_api_instance_id,
                token=settings.green_api_token,
                message_processor=self.processor
            )
            logger.info("WhatsApp bot initialized")

        # Initialize Telegram bot if enabled
        if settings.telegram_enabled:
            self.telegram_bot = TelegramBot(
                api_id=settings.telegram_api_id,
                api_hash=settings.telegram_api_hash,
                phone=settings.telegram_phone,
                session_path=settings.get_telegram_session_path(),
                message_processor=self.processor
            )
            logger.info("Telegram bot initialized")

        logger.info("All components initialized successfully")

    async def start(self) -> None:
        """Start all enabled bots."""
        logger.info("Starting bots...")

        # Start WhatsApp bot
        if self.whatsapp_bot:
            task = asyncio.create_task(self.whatsapp_bot.start())
            self.tasks.append(task)
            logger.info("WhatsApp bot task created")

        # Start Telegram bot
        if self.telegram_bot:
            task = asyncio.create_task(self.telegram_bot.start())
            self.tasks.append(task)
            logger.info("Telegram bot task created")

        if not self.tasks:
            logger.error("No bots enabled! Check your configuration.")
            return

        logger.info(f"Running {len(self.tasks)} bot(s)...")

        # Wait for all tasks
        await asyncio.gather(*self.tasks, return_exceptions=True)

    async def stop(self) -> None:
        """Stop all bots."""
        logger.info("Stopping bots...")

        # Stop WhatsApp bot
        if self.whatsapp_bot:
            await self.whatsapp_bot.stop()

        # Stop Telegram bot
        if self.telegram_bot:
            await self.telegram_bot.stop()

        # Cancel all tasks
        for task in self.tasks:
            if not task.done():
                task.cancel()

        # Close Directus client
        if self.directus:
            await self.directus.close()

        logger.info("All bots stopped")


async def main():
    """Main function."""
    # Setup logger
    setup_logger(
        log_level=settings.log_level,
        log_file=settings.log_file
    )

    logger.info("=" * 60)
    logger.info("WhatsApp & Telegram Bot Starting")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"WhatsApp enabled: {settings.whatsapp_enabled}")
    logger.info(f"Telegram enabled: {settings.telegram_enabled}")
    logger.info("=" * 60)

    # Create orchestrator
    orchestrator = BotOrchestrator()

    try:
        # Initialize components
        await orchestrator.initialize()

        # Start bots
        await orchestrator.start()

    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received")
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
    finally:
        await orchestrator.stop()
        logger.info("Bot shutdown complete")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nShutdown complete")
