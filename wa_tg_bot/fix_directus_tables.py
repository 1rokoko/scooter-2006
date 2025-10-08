"""
Fix Directus tables.
"""

import sqlite3

DB_PATH = r"C:\Users\Аркадий\Documents\augment-projects\scooter-2026\directus-simple\data.db"

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

try:
    # Drop and recreate bot_prompts
    print("Dropping bot_prompts...")
    cursor.execute("DROP TABLE IF EXISTS bot_prompts")
    
    print("Creating bot_prompts...")
    cursor.execute("""
        CREATE TABLE bot_prompts (
            id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
            name TEXT NOT NULL UNIQUE,
            content TEXT NOT NULL,
            messenger TEXT,
            active INTEGER DEFAULT 1,
            date_created TEXT DEFAULT CURRENT_TIMESTAMP,
            date_updated TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Insert default prompt
    print("Creating default prompt...")
    cursor.execute("""
        INSERT INTO bot_prompts (id, name, content, messenger, active)
        VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?)
    """, (
        "default",
        "Ты - дружелюбный помощник компании по аренде самокатов. Отвечай кратко и по делу. Помогай клиентам с вопросами об аренде, ценах и условиях.",
        None,
        1
    ))
    
    conn.commit()
    print("✅ bot_prompts fixed!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    conn.rollback()
finally:
    conn.close()

