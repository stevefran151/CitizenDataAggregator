import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

GENAI_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GENAI_API_KEY:
    print("No API Key found")
else:
    genai.configure(api_key=GENAI_API_KEY)
    try:
        with open("available_models.txt", "w") as f:
            for m in genai.list_models():
                if 'generateContent' in m.supported_generation_methods:
                    f.write(f"{m.name}\n")
        print("Models written to available_models.txt")
    except Exception as e:
        print(f"Error: {e}")
