import requests
import json

url = "http://127.0.0.1:8001/api/observe"
payload = {
    "type": "air",
    "value": 45.0,
    "lat": 13.0827,
    "long": 80.2707,
    "details": {
        "aqi": 45
    }
}

try:
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}")
    data = response.json()
    print("Response data:")
    print(json.dumps(data, indent=2))
except Exception as e:
    print(f"Error: {e}")
