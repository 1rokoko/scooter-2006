"""
Check permissions for leads collection in Directus.
"""

import sqlite3
import os
import json

# Path to Directus database
db_path = os.path.join(os.path.dirname(__file__), "..", "directus-simple", "data.db")

# Connect to database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("🔍 Checking permissions for 'leads' collection...\n")

# Get all permissions for leads
cursor.execute("""
    SELECT id, policy, action, permissions, validation, presets, fields
    FROM directus_permissions 
    WHERE collection = 'leads'
""")

permissions = cursor.fetchall()

if not permissions:
    print("❌ No permissions found for 'leads' collection!")
else:
    print(f"✅ Found {len(permissions)} permission(s) for 'leads':\n")
    for perm in permissions:
        perm_id, policy, action, perms, validation, presets, fields = perm
        print(f"  - Action: {action}")
        print(f"    Policy: {policy}")
        print(f"    Permissions: {perms}")
        print(f"    Fields: {fields}")
        print()

# Check if collection exists
cursor.execute("SELECT collection FROM directus_collections WHERE collection = 'leads'")
if cursor.fetchone():
    print("✅ Collection 'leads' exists in directus_collections")
else:
    print("❌ Collection 'leads' NOT found in directus_collections!")

# Check Administrator policy
cursor.execute("SELECT id, name FROM directus_policies WHERE name = 'Administrator'")
admin_policy = cursor.fetchone()
if admin_policy:
    print(f"✅ Administrator policy found: {admin_policy[0]}")
    
    # Check if permissions use this policy
    cursor.execute("""
        SELECT COUNT(*) FROM directus_permissions 
        WHERE collection = 'leads' AND policy = ?
    """, (admin_policy[0],))
    count = cursor.fetchone()[0]
    print(f"✅ {count} permission(s) for 'leads' use Administrator policy")
else:
    print("❌ Administrator policy not found!")

conn.close()

print("\n" + "="*60)
print("DIAGNOSIS:")
print("="*60)
print("If permissions exist but you still get 403, the issue is likely:")
print("1. Directus cache needs to be cleared")
print("2. Directus needs to be restarted")
print("3. The authentication token is not using the Administrator policy")

