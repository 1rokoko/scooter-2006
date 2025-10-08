"""
Send test message to WhatsApp number +66921692370
"""

import httpx
import asyncio

# Green API credentials
INSTANCE_ID = "1103338824"
API_TOKEN = "4064f1c577214dada7c157a15ea384467f5f5c41f66c46eba9"

# Test phone number (user's number for testing)
TEST_PHONE = "66921692370"  # Without + sign

async def send_test_message():
    """Send test message via Green API"""
    
    url = f"https://api.green-api.com/waInstance{INSTANCE_ID}/sendMessage/{API_TOKEN}"
    
    payload = {
        "chatId": f"{TEST_PHONE}@c.us",
        "message": "🤖 Тест WhatsApp бота!\n\nПривет! Это тестовое сообщение от бота аренды скутеров.\n\nОтветь на это сообщение, чтобы проверить работу AI-ассистента."
    }
    
    print("="*60)
    print("SENDING TEST MESSAGE TO WHATSAPP")
    print("="*60)
    print(f"\nPhone: +{TEST_PHONE}")
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
    print("✅ Test message sent! Check your WhatsApp.")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(send_test_message())

