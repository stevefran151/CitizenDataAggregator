import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = None
if GROQ_API_KEY:
    client = Groq(api_key=GROQ_API_KEY)

# Use a standard Groq model
MODEL_NAME = "llama-3.1-8b-instant" 

def get_chat_response(query: str, observation_context: dict = None):
    """
    Generates a normal AI response to the user query based on the observation context using Groq.
    """
    if not GROQ_API_KEY:
        return "I'm sorry, I cannot answer right now because my brain (Groq API Key) is missing."
    
    if not client:
        return "Groq client not initialized."

    # Context String
    context_str = "No specific observation selected."
    if observation_context:
        context_str = f"""
        Current Observation Context (User's Data):
        - Type: {observation_context.get('type')}
        - Value: {observation_context.get('value')}
        - Valid: {observation_context.get('is_valid')}
        - Location: {observation_context.get('lat')}, {observation_context.get('long')}
        - Details: {observation_context.get('details')}
        """

    # Synthesize Final Answer using Chat LLM
    prompt = f"""
    You are a helpful environmental science assistant.
    
    User Query: {query}
    
    User's Current Observation Context:
    {context_str}
    
    Task:
    Answer the user's question politely and accurately. 
    - Use the Observation Context if relevant to make the answer specific to what the user is looking at.
    - If the user's data is an outlier, mention it and explain what might cause such readings.
    - Be concise, professional, and helpful.
    """
    
    try:
        print(f"Sending prompt to Groq model: {MODEL_NAME}")
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model=MODEL_NAME,
        )
        print("Received response from Groq")
        return chat_completion.choices[0].message.content
    except Exception as e:
        import traceback
        with open("last_error.txt", "w", encoding="utf-8") as f:
            f.write(str(e))
            f.write("\n")
            traceback.print_exc(file=f)
        return f"I encountered an error thinking about that: {e}"

def parse_observation_from_text(text: str):
    """
    Parses natural language text into a structured observation dictionary using Groq.
    """
    if not GROQ_API_KEY or not client:
        return None

    prompt = f"""
    Extract observation data from the following text into JSON format.
    Fields required:
    - type (string, e.g., 'air', 'water', 'noise')
    - value (float)
    - lat (float, optional, null if not found)
    - long (float, optional, null if not found)

    Text: "{text}"

    Return ONLY the JSON object, no markdown formatting.
    """
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model=MODEL_NAME,
        )
        import json
        clean_text = chat_completion.choices[0].message.content.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean_text)
        return data
    except Exception as e:
        print(f"Error parsing voice input: {e}")
        return None

def clean_observation_data(data_list: list):
    """
    Uses AI to clean and sanitize a list of observations.
    It can fix typos in types, handle inconsistent units, and suggest better descriptions.
    """
    if not GROQ_API_KEY or not client or not data_list:
        return data_list

    # Convert observations to a compact string for the LLM
    # Limit to first 50 for cost/latency in MVP, but could be batched
    sample_data = data_list[:50]
    
    prompt = f"""
    You are an expert environmental data scientist. 
    Below is a list of citizen science observations in JSON format.
    
    Tasks:
    1. Standardize 'type' fields (e.g., 'temp' -> 'temperature', 'Air' -> 'air').
    2. Ensure 'value' fields are realistic for their types.
    3. Return the cleaned data as a valid JSON array of objects.
    
    Data to clean:
    {sample_data}
    
    Return ONLY the cleaned JSON array. No explanations.
    """
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model=MODEL_NAME,
        )
        import json
        clean_text = chat_completion.choices[0].message.content.replace("```json", "").replace("```", "").strip()
        cleaned_data = json.loads(clean_text)
        
        # Merge cleaned data back or replace
        # For simplicity in MVP, we return the cleaned sample
        return cleaned_data
    except Exception as e:
        print(f"Error cleaning data with AI: {e}")
        return data_list
