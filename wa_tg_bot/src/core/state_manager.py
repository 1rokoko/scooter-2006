"""
State management for user conversations.
"""

from typing import Optional, Dict, Any
from ..integrations.directus import DirectusClient
from ..utils.logger import logger


class StateManager:
    """Manages user conversation states."""

    def __init__(self, directus_client: DirectusClient):
        """
        Initialize state manager.

        Args:
            directus_client: Directus client instance
        """
        self.directus = directus_client

    async def get_state(self, user_id: str, messenger: str) -> Optional[str]:
        """
        Get user's current state.

        Args:
            user_id: User ID
            messenger: Messenger type

        Returns:
            State name or None
        """
        state_data = await self.directus.get_user_state(user_id, messenger)
        if state_data:
            return state_data.get("state")
        return None

    async def set_state(
        self,
        user_id: str,
        messenger: str,
        state: str,
        data: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Set user's state.

        Args:
            user_id: User ID
            messenger: Messenger type
            state: State name
            data: Additional state data

        Returns:
            True if successful
        """
        return await self.directus.set_user_state(user_id, messenger, state, data)

    async def clear_state(self, user_id: str, messenger: str) -> bool:
        """
        Clear user's state.

        Args:
            user_id: User ID
            messenger: Messenger type

        Returns:
            True if successful
        """
        return await self.directus.clear_user_state(user_id, messenger)


__all__ = ["StateManager"]
