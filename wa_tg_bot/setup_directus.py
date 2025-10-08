"""
Setup Directus collections for the bot.
"""

import asyncio
import sys
import os
import httpx
from loguru import logger

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# Simple config
DIRECTUS_URL = "http://localhost:8055"
DIRECTUS_EMAIL = "seocos@gmail.com"
DIRECTUS_PASSWORD = "directus2024!"


async def create_collections():
    """Create necessary collections in Directus."""

    # Create HTTP client
    client = httpx.AsyncClient(base_url=DIRECTUS_URL, timeout=30.0)

    try:
        # Authenticate
        response = await client.post("/auth/login", json={
            "email": DIRECTUS_EMAIL,
            "password": DIRECTUS_PASSWORD
        })

        if response.status_code != 200:
            logger.error(f"Failed to authenticate: {response.text}")
            return False

        token = response.json()["data"]["access_token"]
        client.headers["Authorization"] = f"Bearer {token}"
        logger.info("✅ Authenticated with Directus")

    except Exception as e:
        logger.error(f"Authentication error: {e}")
        return False

    try:
        # Create bot_prompts collection
        logger.info("Creating bot_prompts collection...")
        await client.post("/collections", json={
            "collection": "bot_prompts",
            "meta": {
                "collection": "bot_prompts",
                "icon": "chat",
                "note": "AI prompts for bot responses",
                "display_template": "{{name}}",
                "hidden": False,
                "singleton": False,
                "translations": None,
                "archive_field": None,
                "archive_app_filter": True,
                "archive_value": None,
                "unarchive_value": None,
                "sort_field": None,
                "accountability": "all",
                "color": None,
                "item_duplication_fields": None,
                "sort": 1,
                "group": None,
                "collapse": "open"
            },
            "schema": {
                "name": "bot_prompts"
            }
        })
        logger.info("✅ bot_prompts collection created")
        
        # Create fields for bot_prompts
        fields = [
            {
                "collection": "bot_prompts",
                "field": "name",
                "type": "string",
                "meta": {
                    "interface": "input",
                    "options": None,
                    "display": None,
                    "display_options": None,
                    "readonly": False,
                    "hidden": False,
                    "sort": 1,
                    "width": "full",
                    "translations": None,
                    "note": "Unique name for the prompt",
                    "conditions": None,
                    "required": True,
                    "group": None,
                    "validation": None,
                    "validation_message": None
                },
                "schema": {
                    "name": "name",
                    "table": "bot_prompts",
                    "data_type": "varchar",
                    "default_value": None,
                    "max_length": 255,
                    "numeric_precision": None,
                    "numeric_scale": None,
                    "is_nullable": False,
                    "is_unique": True,
                    "is_primary_key": False,
                    "has_auto_increment": False,
                    "foreign_key_column": None,
                    "foreign_key_table": None
                }
            },
            {
                "collection": "bot_prompts",
                "field": "content",
                "type": "text",
                "meta": {
                    "interface": "input-rich-text-md",
                    "options": None,
                    "display": None,
                    "display_options": None,
                    "readonly": False,
                    "hidden": False,
                    "sort": 2,
                    "width": "full",
                    "translations": None,
                    "note": "Prompt content for AI",
                    "conditions": None,
                    "required": True,
                    "group": None,
                    "validation": None,
                    "validation_message": None
                },
                "schema": {
                    "name": "content",
                    "table": "bot_prompts",
                    "data_type": "text",
                    "default_value": None,
                    "max_length": None,
                    "numeric_precision": None,
                    "numeric_scale": None,
                    "is_nullable": False,
                    "is_unique": False,
                    "is_primary_key": False,
                    "has_auto_increment": False,
                    "foreign_key_column": None,
                    "foreign_key_table": None
                }
            },
            {
                "collection": "bot_prompts",
                "field": "messenger",
                "type": "string",
                "meta": {
                    "interface": "select-dropdown",
                    "options": {
                        "choices": [
                            {"text": "WhatsApp", "value": "whatsapp"},
                            {"text": "Telegram", "value": "telegram"}
                        ]
                    },
                    "display": None,
                    "display_options": None,
                    "readonly": False,
                    "hidden": False,
                    "sort": 3,
                    "width": "half",
                    "translations": None,
                    "note": "Specific messenger (null = all)",
                    "conditions": None,
                    "required": False,
                    "group": None,
                    "validation": None,
                    "validation_message": None
                },
                "schema": {
                    "name": "messenger",
                    "table": "bot_prompts",
                    "data_type": "varchar",
                    "default_value": None,
                    "max_length": 50,
                    "numeric_precision": None,
                    "numeric_scale": None,
                    "is_nullable": True,
                    "is_unique": False,
                    "is_primary_key": False,
                    "has_auto_increment": False,
                    "foreign_key_column": None,
                    "foreign_key_table": None
                }
            },
            {
                "collection": "bot_prompts",
                "field": "active",
                "type": "boolean",
                "meta": {
                    "interface": "boolean",
                    "options": None,
                    "display": None,
                    "display_options": None,
                    "readonly": False,
                    "hidden": False,
                    "sort": 4,
                    "width": "half",
                    "translations": None,
                    "note": "Is this prompt active?",
                    "conditions": None,
                    "required": False,
                    "group": None,
                    "validation": None,
                    "validation_message": None
                },
                "schema": {
                    "name": "active",
                    "table": "bot_prompts",
                    "data_type": "boolean",
                    "default_value": True,
                    "max_length": None,
                    "numeric_precision": None,
                    "numeric_scale": None,
                    "is_nullable": False,
                    "is_unique": False,
                    "is_primary_key": False,
                    "has_auto_increment": False,
                    "foreign_key_column": None,
                    "foreign_key_table": None
                }
            }
        ]
        
        for field in fields:
            await client.client.post("/fields", json=field)
            logger.info(f"✅ Field {field['field']} created")
        
        # Create default prompt
        logger.info("Creating default prompt...")
        await client.post("/items/bot_prompts", json={
            "name": "default",
            "content": "Ты - дружелюбный помощник компании по аренде самокатов. Отвечай кратко и по делу. Помогай клиентам с вопросами об аренде, ценах и условиях.",
            "messenger": None,
            "active": True
        })
        logger.info("✅ Default prompt created")

        logger.info("\n" + "="*60)
        logger.info("✅ Directus setup completed successfully!")
        logger.info("="*60)

        return True

    except Exception as e:
        logger.error(f"Error creating collections: {e}", exc_info=True)
        return False
    finally:
        await client.aclose()


async def main():
    """Main function."""
    logger.info("="*60)
    logger.info("Directus Setup for Bot")
    logger.info("="*60)

    success = await create_collections()

    if success:
        logger.info("\n✅ Setup completed! You can now start the bot.")
    else:
        logger.error("\n❌ Setup failed. Please check the logs.")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())

