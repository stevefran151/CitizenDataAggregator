
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

print(f"Testing API Key: {api_key[:5]}...")

try:
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Hello")
    print(f"SUCCESS with gemini-1.5-flash: {response.text}")
except Exception as e:
    print(f"ERROR with gemini-1.5-flash: {e}")

try:
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    response = model.generate_content("Hello")
    print(f"SUCCESS with gemini-2.0-flash-exp: {response.text}")
except Exception as e:
    print(f"ERROR with gemini-2.0-flash-exp: {e}")
