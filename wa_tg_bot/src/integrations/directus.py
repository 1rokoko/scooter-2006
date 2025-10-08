"""
Directus API client for bot data management.
"""

import httpx
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from ..utils.logger import logger


class DirectusClient:
    """Client for interacting with Directus API."""

    def __init__(
        self,
        url: str,
        email: Optional[str] = None,
        password: Optional[str] = None,
        token: Optional[str] = None
    ):
        """
        Initialize Directus client.

        Args:
            url: Directus URL
            email: Email for authentication
            password: Password for authentication
            token: Static token (alternative to email/password)
        """
        self.url = url.rstrip('/')
        self.email = email
        self.password = password
        self._token = token
        self.client = httpx.AsyncClient(timeout=30.0)

    async def authenticate(self) -> bool:
        """
        Authenticate with Directus.

        Returns:
            True if authentication successful
        """
        if self._token:
            logger.info("Using static token for Directus")
            return True

        if not self.email or not self.password:
            logger.error("No credentials provided for Directus")
            return False

        try:
            response = await self.client.post(
                f"{self.url}/auth/login",
                json={"email": self.email, "password": self.password}
            )
            response.raise_for_status()
            data = response.json()
            self._token = data["data"]["access_token"]
            logger.info("Successfully authenticated with Directus")
            return True
        except Exception as e:
            logger.error(f"Failed to authenticate with Directus: {e}")
            return False

    def _get_headers(self) -> Dict[str, str]:
        """Get headers with authorization token."""
        return {"Authorization": f"Bearer {self._token}"}

    async def get_prompt(self, name: str, messenger: Optional[str] = None) -> Optional[str]:
        """
        Get AI prompt from Directus.

        Tries to find prompt in this order:
        1. Specific messenger prompt (if messenger provided)
        2. Universal prompt (messenger is null)

        Args:
            name: Prompt name
            messenger: Messenger type filter (optional)

        Returns:
            Prompt content or None
        """
        try:
            import json

            # Try messenger-specific prompt first
            if messenger:
                filter_params = {
                    "name": {"_eq": name},
                    "active": {"_eq": 1},
                    "messenger": {"_eq": messenger}
                }

                response = await self.client.get(
                    f"{self.url}/items/bot_prompts",
                    headers=self._get_headers(),
                    params={"filter": json.dumps(filter_params), "limit": 1}
                )
                response.raise_for_status()
                data = response.json()

                if data["data"]:
                    logger.info(f"Found messenger-specific prompt for {messenger}")
                    return data["data"][0]["content"]

            # Fallback to universal prompt (messenger is null)
            filter_params = {
                "name": {"_eq": name},
                "active": {"_eq": 1},
                "messenger": {"_null": True}
            }

            response = await self.client.get(
                f"{self.url}/items/bot_prompts",
                headers=self._get_headers(),
                params={"filter": json.dumps(filter_params), "limit": 1}
            )
            response.raise_for_status()
            data = response.json()

            if data["data"]:
                logger.info(f"Found universal prompt (messenger=null)")
                return data["data"][0]["content"]

            logger.warning(f"No prompt found with name '{name}'")
            return None

        except Exception as e:
            logger.error(f"Failed to get prompt '{name}': {e}")
            return None

    async def save_message(
        self,
        user_id: str,
        messenger: str,
        direction: str,
        content: str
    ) -> bool:
        """
        Save message to Directus.

        Args:
            user_id: User ID
            messenger: Messenger type
            direction: Message direction (incoming/outgoing)
            content: Message content

        Returns:
            True if saved successfully
        """
        try:
            response = await self.client.post(
                f"{self.url}/items/bot_messages",
                headers=self._get_headers(),
                json={
                    "user_id": user_id,
                    "messenger": messenger,
                    "direction": direction,
                    "content": content,
                    "created_at": datetime.utcnow().isoformat()
                }
            )
            response.raise_for_status()
            return True
        except Exception as e:
            logger.error(f"Failed to save message: {e}")
            return False

    async def create_or_update_lead(
        self,
        user_id: str,
        phone: Optional[str],
        name: Optional[str],
        messenger: str
    ) -> bool:
        """
        Create or update lead in Directus.

        If lead exists (same user_id + messenger), updates last_contact_date.
        If lead doesn't exist, creates new lead.

        Args:
            user_id: User ID (e.g., "66921692370@c.us")
            phone: Phone number (e.g., "66921692370")
            name: User name (optional)
            messenger: Messenger type (whatsapp/telegram)

        Returns:
            True if successful
        """
        try:
            import json

            # Check if lead exists
            filter_params = {
                "user_id": {"_eq": user_id},
                "messenger": {"_eq": messenger}
            }

            response = await self.client.get(
                f"{self.url}/items/leads",
                headers=self._get_headers(),
                params={"filter": json.dumps(filter_params), "limit": 1}
            )
            response.raise_for_status()
            data = response.json()

            now = datetime.utcnow().isoformat()

            if data["data"]:
                # Lead exists - update last_contact_date
                lead_id = data["data"][0]["id"]
                logger.info(f"📝 Updating existing lead {lead_id}")

                response = await self.client.patch(
                    f"{self.url}/items/leads/{lead_id}",
                    headers=self._get_headers(),
                    json={"last_contact_date": now}
                )
                response.raise_for_status()
                logger.info(f"✅ Lead {lead_id} updated")
            else:
                # Lead doesn't exist - create new
                logger.info(f"📝 Creating new lead for {user_id}")

                response = await self.client.post(
                    f"{self.url}/items/leads",
                    headers=self._get_headers(),
                    json={
                        "user_id": user_id,
                        "phone": phone,
                        "name": name or "Unknown",
                        "messenger": messenger,
                        "first_contact_date": now,
                        "last_contact_date": now,
                        "status": "new"
                    }
                )
                response.raise_for_status()
                logger.info(f"✅ New lead created for {user_id}")

            return True

        except Exception as e:
            logger.error(f"❌ Failed to create/update lead: {e}")
            return False

    async def get_user_state(self, user_id: str, messenger: str) -> Optional[Dict[str, Any]]:
        """
        Get user state from Directus.

        Args:
            user_id: User ID
            messenger: Messenger type

        Returns:
            State data or None
        """
        try:
            response = await self.client.get(
                f"{self.url}/items/bot_states",
                headers=self._get_headers(),
                params={
                    "filter": {
                        "user_id": {"_eq": user_id},
                        "messenger": {"_eq": messenger},
                        "expires_at": {"_gte": datetime.utcnow().isoformat()}
                    },
                    "limit": 1
                }
            )
            response.raise_for_status()
            data = response.json()

            if data["data"]:
                return data["data"][0]
            return None
        except Exception as e:
            logger.error(f"Failed to get user state: {e}")
            return None

    async def set_user_state(
        self,
        user_id: str,
        messenger: str,
        state: str,
        data: Optional[Dict[str, Any]] = None,
        ttl_minutes: int = 60
    ) -> bool:
        """
        Set user state in Directus.

        Args:
            user_id: User ID
            messenger: Messenger type
            state: State name
            data: State data
            ttl_minutes: Time to live in minutes

        Returns:
            True if saved successfully
        """
        try:
            expires_at = datetime.utcnow() + timedelta(minutes=ttl_minutes)

            # Check if state exists
            existing = await self.get_user_state(user_id, messenger)

            payload = {
                "user_id": user_id,
                "messenger": messenger,
                "state": state,
                "data": data or {},
                "expires_at": expires_at.isoformat()
            }

            if existing:
                # Update existing state
                response = await self.client.patch(
                    f"{self.url}/items/bot_states/{existing['id']}",
                    headers=self._get_headers(),
                    json=payload
                )
            else:
                # Create new state
                payload["created_at"] = datetime.utcnow().isoformat()
                response = await self.client.post(
                    f"{self.url}/items/bot_states",
                    headers=self._get_headers(),
                    json=payload
                )

            response.raise_for_status()
            return True
        except Exception as e:
            logger.error(f"Failed to set user state: {e}")
            return False

    async def clear_user_state(self, user_id: str, messenger: str) -> bool:
        """
        Clear user state from Directus.

        Args:
            user_id: User ID
            messenger: Messenger type

        Returns:
            True if cleared successfully
        """
        try:
            existing = await self.get_user_state(user_id, messenger)
            if existing:
                response = await self.client.delete(
                    f"{self.url}/items/bot_states/{existing['id']}",
                    headers=self._get_headers()
                )
                response.raise_for_status()
            return True
        except Exception as e:
            logger.error(f"Failed to clear user state: {e}")
            return False

    async def close(self) -> None:
        """Close HTTP client."""
        await self.client.aclose()


__all__ = ["DirectusClient"]

