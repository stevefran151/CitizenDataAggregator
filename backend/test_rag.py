
import ai_agent_service
import sys

try:
    print("Testing Chat with GraphRAG...")
    query = "What are the major threats to biodiversity mentioned in the 2025 report?"
    response = ai_agent_service.get_chat_response(query)
    print("\nResponse:")
    print(response)
except Exception as e:
    print(f"\nError: {e}")
    sys.exit(1)
