"""
Check Green API settings in detail.
"""

import httpx
import asyncio
import json

# Green API credentials
INSTANCE_ID = "1103338824"
API_TOKEN = "4064f1c577214dada7c157a15ea384467f5f5c41f66c46eba9"

async def check_settings():
    """Check Green API settings"""
    
    print("="*60)
    print("GREEN API DETAILED SETTINGS CHECK")
    print("="*60)
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # 1. Get state instance
        print("\n1️⃣ Instance State:")
        url = f"https://api.green-api.com/waInstance{INSTANCE_ID}/getStateInstance/{API_TOKEN}"
        response = await client.get(url)
        if response.status_code == 200:
            data = response.json()
            print(f"   State: {data.get('stateInstance')}")
        else:
            print(f"   ❌ Error: {response.status_code}")
        
        # 2. Get settings
        print("\n2️⃣ Instance Settings:")
        url = f"https://api.green-api.com/waInstance{INSTANCE_ID}/getSettings/{API_TOKEN}"
        response = await client.get(url)
        if response.status_code == 200:
            data = response.json()
            print(f"   Incoming webhook: {data.get('incomingWebhook')}")
            print(f"   Outgoing webhook: {data.get('outgoingWebhook')}")
            print(f"   Outgoing API messages: {data.get('outgoingAPIMessageWebhook')}")
            print(f"   Webhook URL: {data.get('webhookUrl', 'Not set')}")
            print(f"   Webhook URL Token: {data.get('webhookUrlToken', 'Not set')}")
            print(f"   State webhook: {data.get('stateWebhook')}")
            print(f"   Incoming block: {data.get('incomingBlock')}")
            print(f"   Device webhook: {data.get('deviceWebhook')}")
        else:
            print(f"   ❌ Error: {response.status_code}")
        
        # 3. Get WA settings
        print("\n3️⃣ WhatsApp Settings:")
        url = f"https://api.green-api.com/waInstance{INSTANCE_ID}/getWaSettings/{API_TOKEN}"
        response = await client.get(url)
        if response.status_code == 200:
            data = response.json()
            print(f"   Phone: {data.get('phone')}")
            print(f"   Device ID: {data.get('deviceId')}")
            print(f"   State: {data.get('stateInstance')}")
        else:
            print(f"   ❌ Error: {response.status_code}")
        
        # 4. Check notification queue
        print("\n4️⃣ Notification Queue:")
        url = f"https://api.green-api.com/waInstance{INSTANCE_ID}/receiveNotification/{API_TOKEN}"
        response = await client.get(url)
        if response.status_code == 200:
            data = response.json()
            if data:
                print(f"   ✅ Has notifications: {json.dumps(data, indent=2)}")
            else:
                print(f"   Empty queue")
        else:
            print(f"   ❌ Error: {response.status_code}")
    
    print("\n" + "="*60)
    print("RECOMMENDATIONS:")
    print("="*60)
    print("For the bot to receive messages, you need:")
    print("1. incomingWebhook = 'yes' (for receiving messages)")
    print("2. Either:")
    print("   a) webhookUrl set to your server URL (webhook mode)")
    print("   b) OR use polling mode (receiveNotification API)")
    print("\nThe whatsapp-chatbot-python library uses POLLING mode")
    print("So webhookUrl is NOT required.")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(check_settings())

