"""
Get WhatsApp number associated with Green API instance.
"""

import httpx
import asyncio

# Green API credentials
INSTANCE_ID = "1103338824"
API_TOKEN = "4064f1c577214dada7c157a15ea384467f5f5c41f66c46eba9"

async def get_whatsapp_number():
    """Get WhatsApp number"""
    
    print("="*60)
    print("GETTING WHATSAPP NUMBER")
    print("="*60)
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Get WA settings (includes phone number)
        url = f"https://api.green-api.com/waInstance{INSTANCE_ID}/getWaSettings/{API_TOKEN}"
        response = await client.get(url)
        
        if response.status_code == 200:
            data = response.json()
            wid = data.get('wid', '')
            
            if wid:
                # WID format: "79001234567@c.us"
                phone = wid.split('@')[0]
                print(f"\n✅ WhatsApp number: +{phone}")
                print(f"   Full WID: {wid}")
            else:
                print("\n❌ No phone number found")
                print(f"   Response: {data}")
        else:
            print(f"\n❌ Failed to get settings")
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text}")
    
    print("\n" + "="*60)

if __name__ == "__main__":
    asyncio.run(get_whatsapp_number())

