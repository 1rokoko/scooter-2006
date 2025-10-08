"""
Check Green API instance status and settings.
"""

import httpx
import asyncio
import json

# Green API credentials
INSTANCE_ID = "1103338824"
API_TOKEN = "4064f1c577214dada7c157a15ea384467f5f5c41f66c46eba9"

async def check_status():
    """Check Green API instance status"""
    
    print("="*60)
    print("GREEN API INSTANCE STATUS")
    print("="*60)
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Check instance state
        print("\n1️⃣ Checking instance state...")
        state_url = f"https://api.green-api.com/waInstance{INSTANCE_ID}/getStateInstance/{API_TOKEN}"
        response = await client.get(state_url)
        
        if response.status_code == 200:
            data = response.json()
            print(f"   State: {data.get('stateInstance', 'Unknown')}")
        else:
            print(f"   ❌ Failed: {response.status_code}")
        
        # Check settings
        print("\n2️⃣ Checking instance settings...")
        settings_url = f"https://api.green-api.com/waInstance{INSTANCE_ID}/getSettings/{API_TOKEN}"
        response = await client.get(settings_url)
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Incoming webhook: {data.get('incomingWebhook', 'Not set')}")
            print(f"   Outgoing webhook: {data.get('outgoingWebhook', 'Not set')}")
            print(f"   Outgoing API messages: {data.get('outgoingAPIMessageWebhook', 'Not set')}")
            print(f"   Incoming messages: {data.get('incomingBlock', 'Not set')}")
        else:
            print(f"   ❌ Failed: {response.status_code}")
        
        # Check device info
        print("\n3️⃣ Checking device info...")
        device_url = f"https://api.green-api.com/waInstance{INSTANCE_ID}/getWaSettings/{API_TOKEN}"
        response = await client.get(device_url)
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Phone: {data.get('wid', 'Unknown')}")
            print(f"   Avatar: {data.get('avatar', 'Not set')}")
        else:
            print(f"   ❌ Failed: {response.status_code}")
    
    print("\n" + "="*60)

if __name__ == "__main__":
    asyncio.run(check_status())

