"""
Check directus_permissions table structure.
"""

import sqlite3

DB_PATH = r"C:\Users\Аркадий\Documents\augment-projects\scooter-2026\directus-simple\data.db"

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

print("="*60)
print("DIRECTUS_PERMISSIONS TABLE STRUCTURE")
print("="*60)

# Get table schema
cursor.execute("PRAGMA table_info(directus_permissions)")
columns = cursor.fetchall()

print("\nColumns:")
for col in columns:
    print(f"  {col[1]} ({col[2]}) - NOT NULL: {col[3]}, DEFAULT: {col[4]}")

# Get sample permission
print("\n" + "="*60)
print("SAMPLE PERMISSION")
print("="*60)

cursor.execute("SELECT * FROM directus_permissions LIMIT 1")
sample = cursor.fetchone()

if sample:
    print("\nSample row:")
    for i, col in enumerate(columns):
        print(f"  {col[1]}: {sample[i]}")
else:
    print("\n❌ No permissions found")

conn.close()

