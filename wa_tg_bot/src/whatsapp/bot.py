"""
WhatsApp bot using Green API.
"""

import asyncio
import threading
from whatsapp_chatbot_python import GreenAPIBot, Notification
from datetime import datetime
from typing import Optional
from ..core.base import BaseMessenger, BaseMessage, BaseUser, MessengerType, MessageDirection
from ..core.message_processor import MessageProcessor
from ..utils.logger import logger


class WhatsAppBot(BaseMessenger):
    """WhatsApp bot implementation using Green API."""

    def __init__(
        self,
        instance_id: str,
        token: str,
        message_processor: MessageProcessor
    ):
        """
        Initialize WhatsApp bot.

        Args:
            instance_id: Green API instance ID
            token: Green API token
            message_processor: Message processor instance
        """
        self.instance_id = instance_id
        self.token = token
        self.processor = message_processor
        self.bot: Optional[GreenAPIBot] = None
        self.bot_thread: Optional[threading.Thread] = None
        self.loop: Optional[asyncio.AbstractEventLoop] = None

        logger.info(f"WhatsApp bot initialized with instance: {instance_id}")

    async def start(self) -> None:
        """Start WhatsApp bot in a separate thread."""
        try:
            logger.info("Initializing WhatsApp bot...")

            # Save current event loop
            self.loop = asyncio.get_event_loop()

            # Initialize Green API bot
            self.bot = GreenAPIBot(
                self.instance_id,
                self.token
            )

            # Register message handler - MUST be sync function
            @self.bot.router.message()
            def message_handler(notification: Notification) -> None:
                """Handle incoming WhatsApp message"""
                logger.info("🔔 WhatsApp message received!")
                # Run async handler in event loop
                asyncio.run_coroutine_threadsafe(
                    self._handle_notification(notification),
                    self.loop
                )

            logger.info("✅ Message handler registered")

            # Run bot in separate thread (Green API SDK is synchronous)
            def run_bot():
                logger.info("Starting WhatsApp bot (sync mode)...")
                self.bot.run_forever()

            self.bot_thread = threading.Thread(target=run_bot, daemon=True)
            self.bot_thread.start()
            logger.info("✅ WhatsApp bot started in background thread")

        except Exception as e:
            logger.error(f"Failed to start WhatsApp bot: {e}")
            raise

    async def stop(self) -> None:
        """Stop WhatsApp bot."""
        logger.info("Stopping WhatsApp bot...")
        # Green API bot doesn't have explicit stop method
        # It will stop when run_forever() is cancelled

    async def send_message(self, chat_id: str, text: str) -> bool:
        """
        Send message to WhatsApp chat.

        Args:
            chat_id: Chat ID (phone number with @c.us)
            text: Message text

        Returns:
            True if sent successfully
        """
        if not self.bot:
            logger.error("Bot not initialized")
            return False

        try:
            # Green API SDK methods are NOT async - call them directly
            response = self.bot.api.sending.sendMessage(
                chatId=chat_id,
                message=text
            )
            logger.info(f"✅ Sent WhatsApp message to {chat_id}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to send WhatsApp message: {e}")
            return False

    async def handle_incoming(self, message: BaseMessage) -> None:
        """
        Handle incoming WhatsApp message.

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
            logger.error(f"Error handling WhatsApp message: {e}")

    async def _handle_notification(self, notification: Notification) -> None:
        """
        Handle Green API notification.

        Args:
            notification: Green API notification
        """
        try:
            logger.info(f"📨 Received notification: {notification.event.get('typeWebhook', 'unknown')}")

            # Extract message data
            sender_data = notification.event["senderData"]
            message_data = notification.event["messageData"]

            # Create user object
            user = BaseUser(
                id=sender_data["chatId"],
                messenger=MessengerType.WHATSAPP,
                name=sender_data.get("senderName"),
                phone=sender_data.get("sender")
            )

            # Create message object
            message = BaseMessage(
                id=notification.event["idMessage"],
                chat_id=sender_data["chatId"],
                user=user,
                text=message_data.get("textMessageData", {}).get("textMessage", ""),
                messenger=MessengerType.WHATSAPP,
                direction=MessageDirection.INCOMING,
                timestamp=datetime.fromtimestamp(notification.event["timestamp"]),
                metadata=notification.event
            )

            logger.info(f"✅ Received WhatsApp message from {user.phone}: {message.text[:50]}...")

            # Handle message
            await self.handle_incoming(message)

        except Exception as e:
            logger.error(f"❌ Error processing WhatsApp notification: {e}", exc_info=True)

    @property
    def messenger_type(self) -> MessengerType:
        """Get messenger type."""
        return MessengerType.WHATSAPP


__all__ = ["WhatsAppBot"]
