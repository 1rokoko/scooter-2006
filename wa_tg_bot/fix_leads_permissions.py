"""
Fix permissions for leads collection in Directus.
"""

import sqlite3
import os

# Path to Directus database
db_path = os.path.join(os.path.dirname(__file__), "..", "directus-simple", "data.db")

# Connect to database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("🔧 Fixing permissions for 'leads' collection...")

# Get Administrator policy ID
cursor.execute("SELECT id FROM directus_policies WHERE name = 'Administrator'")
policy_result = cursor.fetchone()

if not policy_result:
    print("❌ Administrator policy not found!")
    conn.close()
    exit(1)

policy_id = policy_result[0]
print(f"✅ Found Administrator policy: {policy_id}")

# Check if leads collection exists
cursor.execute("SELECT collection FROM directus_collections WHERE collection = 'leads'")
if not cursor.fetchone():
    print("❌ Collection 'leads' not found!")
    conn.close()
    exit(1)

print("✅ Collection 'leads' exists")

# Add permissions for leads collection
permissions = [
    ('create', {}),
    ('read', {}),
    ('update', {}),
    ('delete', {})
]

for action, permissions_data in permissions:
    # Check if permission already exists
    cursor.execute("""
        SELECT id FROM directus_permissions 
        WHERE policy = ? AND collection = ? AND action = ?
    """, (policy_id, 'leads', action))
    
    if cursor.fetchone():
        print(f"⏭️  Permission '{action}' already exists for 'leads'")
        continue
    
    # Insert permission
    cursor.execute("""
        INSERT INTO directus_permissions (policy, collection, action, permissions, validation, presets, fields)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (policy_id, 'leads', action, '{}', None, None, '*'))
    
    print(f"✅ Added '{action}' permission for 'leads'")

# Commit changes
conn.commit()
conn.close()

print("✅ All permissions fixed!")
print("\n🔄 Please restart Directus for changes to take effect.")

