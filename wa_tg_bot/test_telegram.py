"""
Test Telegram bot by sending a message to yourself.
"""

import asyncio
from telethon import TelegramClient

# Credentials
API_ID = 20941691
API_HASH = "ff88382581fb973cf3d0decef8898499"
SESSION_PATH = "sessions/userbot_session"

async def send_test_message():
    """Send a test message to yourself."""
    
    client = TelegramClient(SESSION_PATH, API_ID, API_HASH)
    
    try:
        await client.connect()
        
        if not await client.is_user_authorized():
            print("❌ Not authorized! Run telegram_auth.py first.")
            return False
        
        # Get your own user
        me = await client.get_me()
        print("="*60)
        print("SENDING TEST MESSAGE TO YOURSELF")
        print("="*60)
        print(f"Logged in as: {me.first_name} {me.last_name or ''}")
        print(f"Username: @{me.username or 'no username'}")
        print(f"Phone: {me.phone}")
        print()
        
        # Send message to yourself (Saved Messages)
        message = "🤖 Тест бота! Привет, это тестовое сообщение для проверки работы Telegram бота."
        
        await client.send_message('me', message)
        
        print(f"✅ Message sent to Saved Messages!")
        print(f"Message: {message}")
        print()
        print("Now check:")
        print("1. Your Telegram Saved Messages - you should see the message")
        print("2. Bot logs - bot should receive and process the message")
        print("3. Directus bot_messages - message should be saved")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
        
    finally:
        await client.disconnect()


if __name__ == "__main__":
    success = asyncio.run(send_test_message())
    
    if success:
        print("\n" + "="*60)
        print("Waiting 10 seconds for bot to process...")
        print("="*60)
        
        import time
        time.sleep(10)
        
        # Check if message was saved to Directus
        import sqlite3
        DB_PATH = r"C:\Users\Аркадий\Documents\augment-projects\scooter-2026\directus-simple\data.db"
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM bot_messages ORDER BY date_created DESC LIMIT 5")
        messages = cursor.fetchall()
        
        print("\n📊 RECENT MESSAGES IN DIRECTUS:")
        if messages:
            for msg in messages:
                print(f"\n  - ID: {msg[0]}")
                print(f"    User: {msg[1]}")
                print(f"    Messenger: {msg[2]}")
                print(f"    Direction: {msg[3]}")
                print(f"    Content: {msg[4]}")
                print(f"    Date: {msg[5]}")
        else:
            print("  ℹ️  No messages found yet")
        
        conn.close()

