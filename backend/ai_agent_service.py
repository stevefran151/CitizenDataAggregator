import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

GENAI_API_KEY = os.getenv("GOOGLE_API_KEY")
if GENAI_API_KEY:
    genai.configure(api_key=GENAI_API_KEY)

# Reverting to use the google-generativeai library directly
# 'ChatGoogleGenerativeAI' is a LangChain class not imported here.
# using a model verified from user's available list
# using a model verified from user's available list
try:
    import google.generativeai as genai
    print(f"AI Agent Service: using genai version {genai.__version__}")
    # Dynamically select a working model
    model = None
    try:
        print("AI Agent Service: Listing available models...")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"AI Agent Service: Found model {m.name}")
                if 'gemini' in m.name:
                    try:
                        model = genai.GenerativeModel(m.name)
                        print(f"AI Agent Service: Selected {m.name}")
                        break
                    except:
                        continue
        
        if model is None:
            # Last ditch attempt
            model = genai.GenerativeModel('gemini-pro')
            print("AI Agent Service: Fallback to hardcoded gemini-pro")
    except Exception as e:
        print(f"AI Agent Service: Error listing models: {e}")
        model = genai.GenerativeModel('gemini-pro')
except Exception as e:
    print(f"AI Agent Service Import Error: {e}")
    model = None

import graph_rag_service

def get_chat_response(query: str, observation_context: dict = None):
    """
    Generates a response to the user query based on the observation context and GraphRAG knowledge base.
    """
    if not GENAI_API_KEY:
        return "I'm sorry, I cannot answer right now because my brain (API Key) is missing."
    
    # 1. Retrieve Knowledge
    rag_response = ""
    try:
        if graph_rag_service.RAG_AVAILABLE:
            rag_response = graph_rag_service.query_graph_rag(query)
        else:
            # Fallback: Simple RAG - Read the knowledge base file directly
            kb_path = os.path.join(os.path.dirname(__file__), "knowledge_base", "biodiversity_report_2025.txt")
            if os.path.exists(kb_path):
                with open(kb_path, "r", encoding="utf-8") as f:
                    rag_response = f"Relevant Report Excerpt:\n{f.read()[:5000]}" # Limit to 5k chars
            else:
                 rag_response = "Knowledge base file not found."
    except Exception as e:
        print(f"RAG Error: {e}")
        rag_response = "Could not retrieve knowledge base."
    
    # 2. Build Context String
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

    # 3. Synthesize Final Answer using Chat LLM
    prompt = f"""
    You are an advanced environmental science assistant for a Citizen Science Data Aggregator.
    
    User Query: {query}
    
    Relevant Knowledge Base Info (GraphRAG):
    {rag_response}
    
    User's Current Observation Context:
    {context_str}
    
    Task:
    Answer the user's question. 
    - Use the Knowledge Base info to provide scientific backing, 2024-2025 trends, or global context.
    - Use the Observation Context to make the answer specific to what the user is looking at.
    - If the user's data is an outlier, explain why based on scientific norms.
    - Be concise, professional, and helpful.
    """
    
    try:
        if model is None:
            return "AI Model not initialized."
            
        print(f"Sending prompt to model (length: {len(prompt)})")
        response = model.generate_content(prompt)
        print("Received response from model")
        return response.text
    except Exception as e:
        import traceback
        with open("last_error.txt", "w", encoding="utf-8") as f:
            f.write(str(e))
            f.write("\n")
            traceback.print_exc(file=f)
        return f"I encountered an error thinking about that: {e}"

def parse_observation_from_text(text: str):
    """
    Parses natural language text into a structured observation dictionary.
    """
    if not GENAI_API_KEY:
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
        response = model.generate_content(prompt)
        import json
        # Clean potential markdown code blocks
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean_text)
        return data
    except Exception as e:
        print(f"Error parsing voice input: {e}")
        return None
