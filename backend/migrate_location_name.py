import sqlite3
import os

db_path = "test_v2.db"
if os.path.exists(db_path):
    try:
        # Check if the database path is correct based on models.py
        # SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test_v2.db")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if column exists first
        cursor.execute("PRAGMA table_info(observations)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if "location_name" not in columns:
            cursor.execute("ALTER TABLE observations ADD COLUMN location_name TEXT")
            conn.commit()
            print("Successfully added location_name column to observations table.")
        else:
            print("location_name column already exists.")
            
        conn.close()
    except Exception as e:
        print(f"Error migrating database: {e}")
else:
    print(f"Database file {db_path} not found.")
