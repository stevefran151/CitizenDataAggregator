import sqlite3
import os

db_path = "test_v2.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT id, location_name FROM observations LIMIT 5")
    rows = cursor.fetchall()
    print("Direct DB check (id, location_name):")
    for r in rows:
        print(r)
    conn.close()
else:
    print("DB not found")
