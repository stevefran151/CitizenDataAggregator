
import requests
import json

url = "http://localhost:8000/api/observe"
payload = {
    "type": "air",
    "value": 50.0,
    "lat": 28.6139,
    "long": 77.2090,
    "details": {
        "aqi": 50,
        "pm25": 12,
        "pm10": 45,
        "co": 0.5
    }
}

try:
    print("Testing Observation Submission...")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
