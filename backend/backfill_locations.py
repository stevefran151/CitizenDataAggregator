import sqlite3
import os
from geocoding_service import geocoder

db_path = "test_v2.db"
if os.path.exists(db_path):
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Select all observations that don't have a location_name
        cursor.execute("SELECT id, lat, long FROM observations WHERE location_name IS NULL OR location_name = ''")
        rows = cursor.fetchall()
        
        print(f"DEBUG: Found {len(rows)} observations to backfill.", flush=True)
        
        for row in rows:
            obs_id, lat, lng = row
            name = geocoder.get_location_name(lat, lng)
            if name:
                cursor.execute("UPDATE observations SET location_name = ? WHERE id = ?", (name, obs_id))
                print(f"Updated ID {obs_id} -> {name}")
                # Nominatim policy: 1 request per second
                import time
                time.sleep(1)
        
        conn.commit()
        conn.close()
        print("Backfill complete.")
    except Exception as e:
        print(f"Error during backfill: {e}")
else:
    print(f"Database file {db_path} not found.")
