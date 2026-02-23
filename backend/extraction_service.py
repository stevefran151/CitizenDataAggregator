import google.generativeai as genai
import os
from dotenv import load_dotenv
import json

load_dotenv()

# Configure Gemini
# Assumes GOOGLE_API_KEY is key in env variables
GENAI_API_KEY = os.getenv("GOOGLE_API_KEY")
if GENAI_API_KEY:
    genai.configure(api_key=GENAI_API_KEY)

model = genai.GenerativeModel('gemini-1.5-flash') # Using a slightly lighter model for MVP or gemini-pro if available

def extract_from_pdf_content(pdf_text: str):
    """
    Parses environmental data from text (extracted from PDF).
    Returns dict with date, pollutant_level, source_agency.
    """
    if not GENAI_API_KEY:
        return {"error": "GOOGLE_API_KEY not set"}

    prompt = f"""
    Extract the following fields from the environmental report text below:
    - Date of observation (ISO 8601 format YYYY-MM-DD)
    - Pollutant level (numeric value, e.g., PM2.5 or generic index)
    - Source Agency (string)

    Return ONLY a JSON object with keys: "date", "pollutant_level", "source_agency".
    
    Text:
    {pdf_text[:10000]} # Limit context for safety
    """
    
    try:
        response = model.generate_content(prompt)
        text_response = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(text_response)
    except Exception as e:
        print(f"Error in GenAI extraction: {e}")
        return None
