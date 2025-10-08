"""
Check Green API for incoming notifications.
"""

import httpx
import asyncio
import json

# Green API credentials
INSTANCE_ID = "1103338824"
API_TOKEN = "4064f1c577214dada7c157a15ea384467f5f5c41f66c46eba9"

async def check_notifications():
    """Check for incoming notifications"""
    
    url = f"https://api.green-api.com/waInstance{INSTANCE_ID}/receiveNotification/{API_TOKEN}"
    
    print("="*60)
    print("CHECKING GREEN API NOTIFICATIONS")
    print("="*60)
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Try to receive notification
        print("\n📥 Checking for notifications...")
        response = await client.get(url)
        
        if response.status_code == 200:
            data = response.json()
            
            if data is None:
                print("\n✅ No pending notifications (queue is empty)")
            else:
                print(f"\n📨 Received notification:")
                print(json.dumps(data, indent=2, ensure_ascii=False))
                
                # Delete notification after reading
                receipt_id = data.get("receiptId")
                if receipt_id:
                    delete_url = f"https://api.green-api.com/waInstance{INSTANCE_ID}/deleteNotification/{API_TOKEN}/{receipt_id}"
                    delete_response = await client.delete(delete_url)
                    print(f"\n🗑️  Notification deleted: {delete_response.status_code == 200}")
        else:
            print(f"\n❌ Failed to check notifications")
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text}")
    
    print("\n" + "="*60)

if __name__ == "__main__":
    asyncio.run(check_notifications())

