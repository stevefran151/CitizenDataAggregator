import sqlite3
import os

db_path = "test_v2.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM observations WHERE location_name IS NULL OR location_name = ''")
    count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM observations")
    total = cursor.fetchone()[0]
    print(f"Pending: {count} / Total: {total}")
    conn.close()
