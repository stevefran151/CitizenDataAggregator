
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

models_to_try = [
    "gemini-1.5-flash",
    "gemini-pro",
    "gemini-1.5-pro",
    "gemini-2.0-flash-exp",
    "gemini-1.0-pro"
]

print("Trying models...")
working_model = None

for m_name in models_to_try:
    print(f"Testing {m_name}...")
    try:
        model = genai.GenerativeModel(m_name)
        response = model.generate_content("Hello")
        print(f"✅ SUCCESS: {m_name}")
        working_model = m_name
        break
    except Exception as e:
        print(f"❌ FAILED {m_name}: {e}")

if working_model:
    print(f"\nFOUND WORKING MODEL: {working_model}")
else:
    print("\nNO WORKING MODEL FOUND.")
