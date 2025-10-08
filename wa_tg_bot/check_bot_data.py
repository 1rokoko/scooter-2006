"""
Check bot data in Directus.
"""

import sqlite3

DB_PATH = r"C:\Users\Аркадий\Documents\augment-projects\scooter-2026\directus-simple\data.db"

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

print("="*60)
print("BOT DATA IN DIRECTUS")
print("="*60)

# Check bot_prompts
print("\n📝 BOT_PROMPTS:")
cursor.execute("SELECT * FROM bot_prompts")
prompts = cursor.fetchall()
if prompts:
    for prompt in prompts:
        print(f"  - ID: {prompt[0]}")
        print(f"    Name: {prompt[1]}")
        print(f"    Content: {prompt[2][:50]}...")
        print(f"    Messenger: {prompt[3]}")
        print(f"    Active: {prompt[4]}")
        print()
else:
    print("  ❌ No prompts found")

# Check bot_messages
print("\n💬 BOT_MESSAGES:")
cursor.execute("SELECT * FROM bot_messages ORDER BY date_created DESC LIMIT 10")
messages = cursor.fetchall()
if messages:
    for msg in messages:
        print(f"  - ID: {msg[0]}")
        print(f"    User: {msg[1]}")
        print(f"    Messenger: {msg[2]}")
        print(f"    Direction: {msg[3]}")
        print(f"    Content: {msg[4][:50]}...")
        print(f"    Date: {msg[5]}")
        print()
else:
    print("  ℹ️  No messages yet")

# Check bot_states
print("\n🔄 BOT_STATES:")
cursor.execute("SELECT * FROM bot_states")
states = cursor.fetchall()
if states:
    for state in states:
        print(f"  - ID: {state[0]}")
        print(f"    User: {state[1]}")
        print(f"    Messenger: {state[2]}")
        print(f"    State: {state[3]}")
        print(f"    Data: {state[4]}")
        print()
else:
    print("  ℹ️  No states yet")

conn.close()

print("="*60)
print("✅ Check complete!")
print("="*60)

