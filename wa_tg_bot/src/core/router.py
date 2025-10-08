"""
Message routing logic.
"""

from typing import Callable, Dict, Optional
from .base import BaseMessage
from ..utils.logger import logger
from ..utils.validators import extract_command


class Router:
    """Routes messages to appropriate handlers."""

    def __init__(self):
        """Initialize router."""
        self.command_handlers: Dict[str, Callable] = {}
        self.default_handler: Optional[Callable] = None

    def register_command(self, command: str, handler: Callable) -> None:
        """
        Register command handler.

        Args:
            command: Command name (without /)
            handler: Handler function
        """
        self.command_handlers[command.lower()] = handler
        logger.info(f"Registered command handler: /{command}")

    def register_default(self, handler: Callable) -> None:
        """
        Register default handler for non-command messages.

        Args:
            handler: Handler function
        """
        self.default_handler = handler
        logger.info("Registered default message handler")

    async def route(self, message: BaseMessage) -> Optional[str]:
        """
        Route message to appropriate handler.

        Args:
            message: Message to route

        Returns:
            Handler response or None
        """
        # Check if message is a command
        command = extract_command(message.text)

        if command and command in self.command_handlers:
            # Route to command handler
            handler = self.command_handlers[command]
            logger.info(f"Routing to command handler: /{command}")
            return await handler(message)

        # Route to default handler
        if self.default_handler:
            logger.info("Routing to default handler")
            return await self.default_handler(message)

        logger.warning("No handler found for message")
        return None


__all__ = ["Router"]
