"""
Send test message TO the bot (from user's number to bot's number).
This simulates a user sending a message to the bot.
"""

import httpx
import asyncio

# Green API credentials
INSTANCE_ID = "1103338824"
API_TOKEN = "4064f1c577214dada7c157a15ea384467f5f5c41f66c46eba9"

# Bot's WhatsApp number (the number that receives messages)
BOT_PHONE = "66823871422"  # This is the bot's number

async def send_message_to_bot():
    """Send test message to the bot"""
    
    url = f"https://api.green-api.com/waInstance{INSTANCE_ID}/sendMessage/{API_TOKEN}"
    
    payload = {
        "chatId": f"{BOT_PHONE}@c.us",
        "message": "🧪 Тест! Привет, бот! Это тестовое сообщение для проверки работы системы. Расскажи мне про аренду скутеров."
    }
    
    print("="*60)
    print("SENDING TEST MESSAGE TO BOT")
    print("="*60)
    print(f"\nBot phone: +{BOT_PHONE}")
    print(f"Message: {payload['message']}")
    print("\nSending...")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload)
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ Message sent successfully!")
            print(f"Message ID: {data.get('idMessage', 'N/A')}")
        else:
            print(f"\n❌ Failed to send message")
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text}")
    
    print("\n" + "="*60)
    print("✅ Now check bot logs for incoming message processing!")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(send_message_to_bot())

