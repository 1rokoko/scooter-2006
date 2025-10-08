"""
Fix permissions for leads collection - set permissions to {} instead of NULL.
"""

import sqlite3
import os

# Path to Directus database
db_path = os.path.join(os.path.dirname(__file__), "..", "directus-simple", "data.db")

# Connect to database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("🔧 Fixing permissions for 'leads' collection...")

# Update all permissions for leads to have {} instead of NULL
cursor.execute("""
    UPDATE directus_permissions 
    SET permissions = '{}'
    WHERE collection = 'leads' AND permissions IS NULL
""")

rows_updated = cursor.rowcount
print(f"✅ Updated {rows_updated} permission(s)")

# Commit changes
conn.commit()

# Verify
cursor.execute("""
    SELECT action, permissions 
    FROM directus_permissions 
    WHERE collection = 'leads'
""")

print("\n📋 Current permissions for 'leads':")
for action, perms in cursor.fetchall():
    print(f"  - {action}: {perms}")

conn.close()

print("\n✅ Permissions fixed!")
print("🔄 Please restart Directus for changes to take effect.")

