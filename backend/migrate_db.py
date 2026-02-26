
import sqlite3
import os

db_path = "test_v2.db"
if os.path.exists(db_path):
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("ALTER TABLE observations ADD COLUMN is_expert BOOLEAN DEFAULT 0")
        conn.commit()
        conn.close()
        print("Successfully added is_expert column to observations table.")
    except Exception as e:
        print(f"Error adding column: {e}")
else:
    print(f"Database file {db_path} not found.")
