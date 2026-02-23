
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

print(f"Testing API Key: {api_key[:10]}...")

try:
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Hello")
    print(f"SUCCESS: {response.text}")
except Exception as e:
    print(f"ERROR: {e}")

try:
    print("Listing models...")
    for m in genai.list_models():
        print(f" - {m.name}")
except Exception as e:
    print(f"Listing Error: {e}")
