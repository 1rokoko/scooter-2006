"""
Simple Directus setup using SQL.
"""

import sqlite3
import os

# Path to Directus database
DB_PATH = r"C:\Users\Аркадий\Documents\augment-projects\scooter-2026\directus-simple\data.db"

def setup_collections():
    """Create bot collections in Directus SQLite database."""
    
    if not os.path.exists(DB_PATH):
        print(f"❌ Database not found: {DB_PATH}")
        return False
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Create bot_prompts table
        print("Creating bot_prompts table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS bot_prompts (
                id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
                name TEXT NOT NULL UNIQUE,
                content TEXT NOT NULL,
                messenger TEXT,
                active INTEGER DEFAULT 1,
                date_created TEXT DEFAULT CURRENT_TIMESTAMP,
                date_updated TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✅ bot_prompts table created")
        
        # Create bot_messages table
        print("Creating bot_messages table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS bot_messages (
                id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
                user_id TEXT NOT NULL,
                messenger TEXT NOT NULL,
                direction TEXT NOT NULL,
                content TEXT NOT NULL,
                date_created TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✅ bot_messages table created")
        
        # Create bot_states table
        print("Creating bot_states table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS bot_states (
                id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
                user_id TEXT NOT NULL,
                messenger TEXT NOT NULL,
                state TEXT NOT NULL,
                data TEXT,
                date_created TEXT DEFAULT CURRENT_TIMESTAMP,
                expires_at TEXT NOT NULL,
                UNIQUE(user_id, messenger)
            )
        """)
        print("✅ bot_states table created")
        
        # Create indexes
        print("Creating indexes...")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_bot_messages_user_id ON bot_messages(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_bot_messages_messenger ON bot_messages(messenger)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_bot_states_user_messenger ON bot_states(user_id, messenger)")
        print("✅ Indexes created")
        
        # Insert default prompt
        print("Creating default prompt...")
        cursor.execute("""
            INSERT OR IGNORE INTO bot_prompts (name, content, messenger, active)
            VALUES (?, ?, ?, ?)
        """, (
            "default",
            "Ты - дружелюбный помощник компании по аренде самокатов. Отвечай кратко и по делу. Помогай клиентам с вопросами об аренде, ценах и условиях.",
            None,
            1
        ))
        print("✅ Default prompt created")
        
        conn.commit()
        print("\n" + "="*60)
        print("✅ Directus setup completed successfully!")
        print("="*60)
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()


if __name__ == "__main__":
    print("="*60)
    print("Directus Setup for Bot (Simple)")
    print("="*60)
    
    if setup_collections():
        print("\n✅ Setup completed! You can now start the bot.")
    else:
        print("\n❌ Setup failed.")

