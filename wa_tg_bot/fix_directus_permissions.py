"""
Fix Directus permissions for bot collections.
"""

import sqlite3
import uuid

DB_PATH = r"C:\Users\Аркадий\Documents\augment-projects\scooter-2026\directus-simple\data.db"

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

print("="*60)
print("FIXING DIRECTUS PERMISSIONS")
print("="*60)

# Get Administrator policy ID
cursor.execute("SELECT id FROM directus_policies WHERE name = 'Administrator'")
policy = cursor.fetchone()

if not policy:
    print("❌ Administrator policy not found!")
    conn.close()
    exit(1)

policy_id = policy[0]
print(f"\n✅ Found Administrator policy: {policy_id}")

# Collections to grant access to
collections = ['bot_prompts', 'bot_messages', 'bot_states']

# Actions to grant
actions = ['create', 'read', 'update', 'delete']

print("\n📝 Granting permissions...")

for collection in collections:
    for action in actions:
        # Check if permission already exists
        cursor.execute("""
            SELECT id FROM directus_permissions 
            WHERE policy = ? AND collection = ? AND action = ?
        """, (policy_id, collection, action))
        
        existing = cursor.fetchone()
        
        if existing:
            print(f"  ℹ️  Permission already exists: {collection}.{action}")
        else:
            # Create new permission (id is auto-increment)
            cursor.execute("""
                INSERT INTO directus_permissions (policy, collection, action, permissions, validation, presets, fields)
                VALUES (?, ?, ?, NULL, NULL, NULL, '*')
            """, (policy_id, collection, action))
            print(f"  ✅ Created permission: {collection}.{action}")

# Commit changes
conn.commit()

print("\n" + "="*60)
print("✅ Permissions fixed successfully!")
print("="*60)

# Verify permissions
print("\n📊 CURRENT PERMISSIONS FOR BOT COLLECTIONS:")
for collection in collections:
    cursor.execute("""
        SELECT action FROM directus_permissions 
        WHERE policy = ? AND collection = ?
        ORDER BY action
    """, (policy_id, collection))
    
    permissions = cursor.fetchall()
    actions_list = [p[0] for p in permissions]
    
    print(f"\n  {collection}:")
    print(f"    Actions: {', '.join(actions_list)}")

conn.close()

print("\n" + "="*60)
print("✅ Done! Try accessing bot_prompts in Directus now.")
print("="*60)

