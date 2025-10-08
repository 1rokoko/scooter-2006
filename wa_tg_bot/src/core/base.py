"""
Base abstractions for messengers.
Defines universal interfaces for WhatsApp and Telegram.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum


class MessengerType(str, Enum):
    """Messenger type enumeration."""
    WHATSAPP = "whatsapp"
    TELEGRAM = "telegram"


class MessageDirection(str, Enum):
    """Message direction enumeration."""
    INCOMING = "incoming"
    OUTGOING = "outgoing"


@dataclass
class BaseUser:
    """Universal user model."""
    id: str  # User ID in messenger
    messenger: MessengerType
    name: Optional[str] = None
    phone: Optional[str] = None
    username: Optional[str] = None

    def __str__(self) -> str:
        return f"{self.name or self.username or self.id} ({self.messenger.value})"


@dataclass
class BaseMessage:
    """Universal message model."""
    id: str  # Message ID
    chat_id: str  # Chat ID
    user: BaseUser  # Sender
    text: str  # Message text
    messenger: MessengerType
    direction: MessageDirection
    timestamp: datetime
    metadata: Dict[str, Any]  # Additional data

    def __str__(self) -> str:
        return f"[{self.messenger.value}] {self.user.name}: {self.text[:50]}"


class BaseMessenger(ABC):
    """Abstract base class for all messengers."""

    @abstractmethod
    async def start(self) -> None:
        """Start the messenger bot."""
        pass

    @abstractmethod
    async def stop(self) -> None:
        """Stop the messenger bot."""
        pass

    @abstractmethod
    async def send_message(self, chat_id: str, text: str) -> bool:
        """
        Send a message to a chat.

        Args:
            chat_id: Chat ID to send message to
            text: Message text

        Returns:
            True if message was sent successfully
        """
        pass

    @abstractmethod
    async def handle_incoming(self, message: BaseMessage) -> None:
        """
        Handle incoming message.

        Args:
            message: Incoming message
        """
        pass

    @property
    @abstractmethod
    def messenger_type(self) -> MessengerType:
        """Get messenger type."""
        pass


__all__ = [
    "MessengerType",
    "MessageDirection",
    "BaseUser",
    "BaseMessage",
    "BaseMessenger"
]
