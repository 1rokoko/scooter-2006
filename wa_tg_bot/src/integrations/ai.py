"""
DeepSeek AI integration using OpenAI-compatible API.
"""

from openai import OpenAI, AsyncOpenAI
from typing import List, Dict, Optional
from ..utils.logger import logger


class DeepSeekClient:
    """Client for DeepSeek AI API."""

    def __init__(
        self,
        api_key: str,
        model: str = "deepseek-chat",
        base_url: str = "https://api.deepseek.com",
        temperature: float = 0.7,
        max_tokens: int = 2000
    ):
        """
        Initialize DeepSeek client.

        Args:
            api_key: DeepSeek API key
            model: Model name
            base_url: API base URL
            temperature: Response temperature (0.0 - 2.0)
            max_tokens: Maximum tokens in response
        """
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens

        # Initialize async client
        self.client = AsyncOpenAI(
            api_key=api_key,
            base_url=base_url
        )

        logger.info(f"DeepSeek client initialized with model: {model}")

    async def generate_response(
        self,
        user_message: str,
        system_prompt: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Optional[str]:
        """
        Generate AI response.

        Args:
            user_message: User's message
            system_prompt: System prompt (optional)
            conversation_history: Previous messages (optional)

        Returns:
            AI response or None if failed
        """
        try:
            # Build messages
            messages = []

            # Add system prompt
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})

            # Add conversation history
            if conversation_history:
                messages.extend(conversation_history)

            # Add current user message
            messages.append({"role": "user", "content": user_message})

            # Call API
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )

            # Extract response
            if response.choices:
                content = response.choices[0].message.content
                logger.info(f"Generated AI response ({len(content)} chars)")
                return content

            logger.warning("No response from AI")
            return None

        except Exception as e:
            logger.error(f"Failed to generate AI response: {e}")
            return None

    async def generate_simple_response(self, user_message: str, system_prompt: Optional[str] = None) -> Optional[str]:
        """
        Generate simple AI response without conversation history.

        Args:
            user_message: User's message
            system_prompt: System prompt (optional)

        Returns:
            AI response or None if failed
        """
        return await self.generate_response(
            user_message=user_message,
            system_prompt=system_prompt,
            conversation_history=None
        )


__all__ = ["DeepSeekClient"]
