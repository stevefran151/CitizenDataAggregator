import requests

try:
    res = requests.get("http://localhost:8000/api/v1/data")
    if res.status_code == 200:
        data = res.json()
        if data:
            print(f"Sample observation location_name: {data[0].get('location_name')}")
            print(f"Full first object: {data[0]}")
        else:
            print("No data found.")
    else:
        print(f"Error: {res.status_code}")
except Exception as e:
    print(f"Error: {e}")
