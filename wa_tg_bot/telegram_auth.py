"""
Interactive Telegram authorization script.
"""

import asyncio
from telethon import TelegramClient
import os

# Credentials from .env
API_ID = 20941691
API_HASH = "ff88382581fb973cf3d0decef8898499"
PHONE = "+66823871422"
SESSION_PATH = "sessions/userbot_session"

async def authorize():
    """Authorize Telegram account."""
    
    # Ensure sessions directory exists
    os.makedirs("sessions", exist_ok=True)
    
    print("="*60)
    print("Telegram Authorization")
    print("="*60)
    print(f"Phone: {PHONE}")
    print(f"Session: {SESSION_PATH}")
    print("="*60)
    
    # Create client
    client = TelegramClient(SESSION_PATH, API_ID, API_HASH)
    
    try:
        # Connect
        print("\nConnecting to Telegram...")
        await client.connect()
        
        # Check if already authorized
        if await client.is_user_authorized():
            print("✅ Already authorized!")
            me = await client.get_me()
            print(f"Logged in as: {me.first_name} {me.last_name or ''} (@{me.username or 'no username'})")
            print(f"Phone: {me.phone}")
            return True
        
        # Start authorization
        print("\nStarting authorization...")
        await client.send_code_request(PHONE)
        print(f"\n📱 Code sent to {PHONE}")
        print("Please check your Telegram app for the code.")
        print("\nEnter the code below (format: 12345):")
        
        # Wait for code input
        code = input("Code: ").strip()
        
        try:
            # Sign in with code
            await client.sign_in(PHONE, code)
            print("✅ Successfully signed in!")
            
        except Exception as e:
            if "Two-steps verification" in str(e) or "2FA" in str(e) or "password" in str(e).lower():
                print("\n🔐 2FA is enabled. Please enter your password:")
                password = input("Password: ").strip()
                await client.sign_in(password=password)
                print("✅ Successfully signed in with 2FA!")
            else:
                raise
        
        # Get user info
        me = await client.get_me()
        print(f"\n✅ Authorization successful!")
        print(f"Logged in as: {me.first_name} {me.last_name or ''} (@{me.username or 'no username'})")
        print(f"Phone: {me.phone}")
        print(f"Session saved to: {SESSION_PATH}.session")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False
        
    finally:
        await client.disconnect()


if __name__ == "__main__":
    success = asyncio.run(authorize())
    
    if success:
        print("\n" + "="*60)
        print("✅ Telegram authorization completed!")
        print("You can now start the bot with: python -m src.main")
        print("="*60)
    else:
        print("\n" + "="*60)
        print("❌ Authorization failed. Please try again.")
        print("="*60)

