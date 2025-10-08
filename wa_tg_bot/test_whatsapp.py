"""
Test WhatsApp bot by sending a message via Green API.
"""

import requests
import time

# Green API credentials
INSTANCE_ID = "1103338824"
API_TOKEN = "4064f1c577214dada7c157a15ea384467f5f5c41f66c46eba9"

# Test phone number (your own number to send test message to yourself)
# Format: country code + number without + or spaces
# Example: 66823871422 for +66 82 387 1422
TEST_PHONE = "66823871422"  # Thailand number from Telegram auth

def send_test_message():
    """Send a test message via Green API."""
    
    url = f"https://api.green-api.com/waInstance{INSTANCE_ID}/sendMessage/{API_TOKEN}"
    
    payload = {
        "chatId": f"{TEST_PHONE}@c.us",
        "message": "🤖 Тест бота! Привет, это тестовое сообщение для проверки работы WhatsApp бота."
    }
    
    print("="*60)
    print("SENDING TEST MESSAGE VIA GREEN API")
    print("="*60)
    print(f"Instance ID: {INSTANCE_ID}")
    print(f"Phone: +{TEST_PHONE}")
    print(f"Message: {payload['message']}")
    print()
    
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("\n✅ Message sent successfully!")
            print("\nNow check:")
            print("1. WhatsApp on your phone - you should receive the message")
            print("2. Bot logs - bot should receive and process the message")
            print("3. Directus bot_messages - message should be saved")
            return True
        else:
            print(f"\n❌ Failed to send message: {response.text}")
            return False
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False


if __name__ == "__main__":
    success = send_test_message()
    
    if success:
        print("\n" + "="*60)
        print("Waiting 10 seconds for bot to process...")
        print("="*60)
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

