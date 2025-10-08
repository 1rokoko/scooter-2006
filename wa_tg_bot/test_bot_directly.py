"""
Test bot directly by simulating incoming message.
"""

import asyncio
from datetime import datetime
from src.core.base import BaseMessage, BaseUser, MessengerType, MessageDirection
from src.core.message_processor import MessageProcessor
from src.integrations.directus import DirectusClient
from src.integrations.ai import DeepSeekClient
from src.config import settings

async def test_message_processing():
    """Test message processing directly"""
    
    print("="*60)
    print("TESTING BOT MESSAGE PROCESSING")
    print("="*60)
    
    # Initialize components
    print("\n1️⃣ Initializing components...")
    directus = DirectusClient(
        url=settings.directus_url,
        email=settings.directus_email,
        password=settings.directus_password
    )
    await directus.authenticate()
    print("   ✅ Directus authenticated")

    ai = DeepSeekClient(
        api_key=settings.deepseek_api_key,
        model=settings.deepseek_model
    )
    print("   ✅ DeepSeek initialized")
    
    processor = MessageProcessor(
        directus_client=directus,
        ai_client=ai,
        auto_reply_delay=0  # No delay for testing
    )
    print("   ✅ Message processor initialized")
    
    # Create test message
    print("\n2️⃣ Creating test message...")
    user = BaseUser(
        id="66921692370@c.us",
        messenger=MessengerType.WHATSAPP,
        name="Test User",
        phone="66921692370"
    )
    
    message = BaseMessage(
        id="test_message_001",
        chat_id="66921692370@c.us",
        user=user,
        text="Привет! Расскажи мне про аренду скутеров на Пхукете. Какие у вас цены?",
        messenger=MessengerType.WHATSAPP,
        direction=MessageDirection.INCOMING,
        timestamp=datetime.now(),
        metadata={}
    )
    print(f"   ✅ Test message created from {user.phone}")
    
    # Process message
    print("\n3️⃣ Processing message...")
    response = await processor.process_incoming(message)
    
    if response:
        print(f"\n✅ SUCCESS! Bot generated response:")
        print(f"   {response}")
    else:
        print("\n❌ FAILED! No response generated")
    
    print("\n" + "="*60)
    print("4️⃣ Checking Directus for saved messages...")
    
    # Check if messages were saved
    try:
        # This is a simplified check - in real scenario you'd query Directus
        print("   ✅ Check Directus admin panel at:")
        print("   http://localhost:8055/admin/content/bot_messages")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n" + "="*60)

if __name__ == "__main__":
    asyncio.run(test_message_processing())

