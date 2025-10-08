"""
Telegram userbot using Telethon.
"""

from telethon import TelegramClient, events
from datetime import datetime
from typing import Optional
from ..core.base import BaseMessenger, BaseMessage, BaseUser, MessengerType, MessageDirection
from ..core.message_processor import MessageProcessor
from ..utils.logger import logger


class TelegramBot(BaseMessenger):
    """Telegram userbot implementation using Telethon."""

    def __init__(
        self,
        api_id: int,
        api_hash: str,
        phone: str,
        session_path: str,
        message_processor: MessageProcessor
    ):
        """
        Initialize Telegram bot.

        Args:
            api_id: Telegram API ID
            api_hash: Telegram API Hash
            phone: Phone number
            session_path: Path to session file
            message_processor: Message processor instance
        """
        self.api_id = api_id
        self.api_hash = api_hash
        self.phone = phone
        self.session_path = session_path
        self.processor = message_processor
        self.client: Optional[TelegramClient] = None

        logger.info(f"Telegram bot initialized for {phone}")

    async def start(self) -> None:
        """Start Telegram bot."""
        try:
            # Initialize Telethon client
            self.client = TelegramClient(
                self.session_path,
                self.api_id,
                self.api_hash
            )

            # Register message handler
            @self.client.on(events.NewMessage(incoming=True))
            async def message_handler(event):
                await self._handle_event(event)

            # Start client
            logger.info("Starting Telegram bot...")
            await self.client.start(phone=self.phone)

            # Get self info
            me = await self.client.get_me()
            logger.info(f"Telegram bot started as: {me.first_name} (@{me.username})")

            # Run until disconnected
            await self.client.run_until_disconnected()

        except Exception as e:
            logger.error(f"Failed to start Telegram bot: {e}")
            raise

    async def stop(self) -> None:
        """Stop Telegram bot."""
        if self.client:
            logger.info("Stopping Telegram bot...")
            await self.client.disconnect()

    async def send_message(self, chat_id: str, text: str) -> bool:
        """
        Send message to Telegram chat.

        Args:
            chat_id: Chat ID (user ID or username)
            text: Message text

        Returns:
            True if sent successfully
        """
        if not self.client:
            logger.error("Client not initialized")
            return False

        try:
            # Convert chat_id to int if it's a string
            chat_id_int = int(chat_id) if isinstance(chat_id, str) else chat_id

            await self.client.send_message(chat_id_int, text)
            logger.info(f"✅ Sent Telegram message to {chat_id}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to send Telegram message: {e}", exc_info=True)
            return False

    async def handle_incoming(self, message: BaseMessage) -> None:
        """
        Handle incoming Telegram message.

        Args:
            message: Incoming message
        """
        try:
            # Process message and get response
            response = await self.processor.process_incoming(message)

            # Send response if generated
            if response:
                await self.send_message(message.chat_id, response)

        except Exception as e:
            logger.error(f"Error handling Telegram message: {e}")

    async def _handle_event(self, event) -> None:
        """
        Handle Telethon event.

        Args:
            event: Telethon event
        """
        try:
            # Get sender
            sender = await event.get_sender()

            # Create user object
            user = BaseUser(
                id=str(sender.id),
                messenger=MessengerType.TELEGRAM,
                name=f"{sender.first_name or ''} {sender.last_name or ''}".strip(),
                username=sender.username
            )

            # Create message object
            message = BaseMessage(
                id=str(event.message.id),
                chat_id=str(event.chat_id),
                user=user,
                text=event.message.text or "",
                messenger=MessengerType.TELEGRAM,
                direction=MessageDirection.INCOMING,
                timestamp=event.message.date or datetime.now(),
                metadata={"event": event}
            )

            logger.info(f"Received Telegram message from {user}")

            # Handle message
            await self.handle_incoming(message)

        except Exception as e:
            logger.error(f"Error processing Telegram event: {e}")

    @property
    def messenger_type(self) -> MessengerType:
        """Get messenger type."""
        return MessengerType.TELEGRAM


__all__ = ["TelegramBot"]
