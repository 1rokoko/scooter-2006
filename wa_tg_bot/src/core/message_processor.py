"""
Message processing logic.
"""

import asyncio
from typing import Optional
from .base import BaseMessage, MessageDirection
from ..integrations.directus import DirectusClient
from ..integrations.ai import DeepSeekClient
from ..utils.logger import logger
from ..utils.validators import sanitize_text


class MessageProcessor:
    """Processes incoming and outgoing messages."""

    def __init__(
        self,
        directus_client: DirectusClient,
        ai_client: DeepSeekClient,
        auto_reply_delay: int = 2
    ):
        """
        Initialize message processor.

        Args:
            directus_client: Directus client
            ai_client: AI client
            auto_reply_delay: Delay before auto-reply (seconds)
        """
        self.directus = directus_client
        self.ai = ai_client
        self.auto_reply_delay = auto_reply_delay

    async def process_incoming(self, message: BaseMessage) -> Optional[str]:
        """
        Process incoming message and generate response.

        Args:
            message: Incoming message

        Returns:
            Response text or None
        """
        try:
            logger.info(f"🔄 Processing message from {message.user.id}: {message.text[:50]}...")

            # Create or update lead FIRST (before saving message)
            logger.info("👤 Creating/updating lead in Directus...")
            await self.directus.create_or_update_lead(
                user_id=message.user.id,
                phone=message.user.phone,
                name=message.user.name,
                messenger=message.messenger.value
            )
            logger.info("✅ Lead created/updated")

            # Save incoming message
            logger.info("💾 Saving incoming message to Directus...")
            await self.directus.save_message(
                user_id=message.user.id,
                messenger=message.messenger.value,
                direction=MessageDirection.INCOMING.value,
                content=message.text
            )
            logger.info("✅ Message saved to Directus")

            # Sanitize input
            clean_text = sanitize_text(message.text)
            logger.info(f"🧹 Sanitized text: {clean_text[:50]}...")

            # Get system prompt from Directus
            logger.info("📝 Getting system prompt from Directus...")
            system_prompt = await self.directus.get_prompt(
                name="default",
                messenger=message.messenger.value
            )
            logger.info(f"✅ Got system prompt: {system_prompt[:50]}...")

            # Add delay before responding (simulate human behavior)
            if self.auto_reply_delay > 0:
                logger.info(f"⏳ Waiting {self.auto_reply_delay}s before responding...")
                await asyncio.sleep(self.auto_reply_delay)

            # Generate AI response
            logger.info("🤖 Generating AI response...")
            response = await self.ai.generate_simple_response(
                user_message=clean_text,
                system_prompt=system_prompt
            )
            logger.info(f"✅ AI response generated: {response[:50] if response else 'None'}...")

            if response:
                # Save outgoing message
                logger.info("💾 Saving outgoing message to Directus...")
                await self.directus.save_message(
                    user_id=message.user.id,
                    messenger=message.messenger.value,
                    direction=MessageDirection.OUTGOING.value,
                    content=response
                )
                logger.info("✅ Outgoing message saved to Directus")

                logger.info(f"✅ Generated response for {message.user}")
                return response

            logger.warning(f"⚠️ No response generated for {message.user}")
            return None

        except Exception as e:
            logger.error(f"❌ Error processing message: {e}", exc_info=True)
            return None


__all__ = ["MessageProcessor"]
