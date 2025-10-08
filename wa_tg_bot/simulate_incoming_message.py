"""
Simulate incoming WhatsApp message by manually creating notification.
This helps test the bot's message handling without needing a real user.
"""

import asyncio
import httpx

# Green API credentials
INSTANCE_ID = "1103338824"
API_TOKEN = "4064f1c577214dada7c157a15ea384467f5f5c41f66c46eba9"

async def check_incoming_notifications():
    """Check for incoming notifications in Green API queue"""
    
    url = f"https://api.green-api.com/waInstance{INSTANCE_ID}/receiveNotification/{API_TOKEN}"
    
    print("="*60)
    print("CHECKING FOR INCOMING NOTIFICATIONS")
    print("="*60)
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        for i in range(5):
            print(f"\n🔍 Attempt {i+1}/5...")
            
            response = await client.get(url)
            
            if response.status_code == 200:
                data = response.json()
                
                if data:
                    print(f"\n✅ Found notification!")
                    print(f"Receipt ID: {data.get('receiptId')}")
                    print(f"Body: {data.get('body', {})}")
                    
                    # Delete notification to acknowledge
                    delete_url = f"https://api.green-api.com/waInstance{INSTANCE_ID}/deleteNotification/{API_TOKEN}/{data['receiptId']}"
                    await client.delete(delete_url)
                    print(f"✅ Notification deleted (acknowledged)")
                else:
                    print("   No notifications in queue")
            else:
                print(f"   ❌ Error: {response.status_code}")
            
            await asyncio.sleep(2)
    
    print("\n" + "="*60)

if __name__ == "__main__":
    asyncio.run(check_incoming_notifications())

