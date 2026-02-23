
import os
try:
    from llama_index.core import (
        VectorStoreIndex,
        SimpleDirectoryReader,
        StorageContext,
        load_index_from_storage,
        Settings,
        KnowledgeGraphIndex
    )
    from llama_index.llms.gemini import Gemini
    from llama_index.embeddings.google import GoogleGenerativeAIEmbedding
    from llama_index.core.graph_stores import SimpleGraphStore
    RAG_AVAILABLE = True
except ImportError as e:
    print(f"GraphRAG Import Error: {e}. GraphRAG will be disabled.")
    RAG_AVAILABLE = False

# Use the same API key from environment
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Initialize Gemini
if RAG_AVAILABLE:
    try:
        llm = Gemini(model="models/gemini-1.5-flash", api_key=GOOGLE_API_KEY)
        embed_model = GoogleGenerativeAIEmbedding(model="models/embedding-001", api_key=GOOGLE_API_KEY)

        # Set global settings
        Settings.llm = llm
        Settings.embed_model = embed_model
        Settings.chunk_size = 512
    except Exception as e:
        print(f"GraphRAG Init Error: {e}")
        RAG_AVAILABLE = False


PERSIST_DIR = "./storage"

def get_graph_rag_query_engine():
    """
    Initializes or loads the Graph RAG index and returns a query engine.
    """
    if not RAG_AVAILABLE:
        return None
        
    if not os.path.exists(PERSIST_DIR):
        print("Creating new GraphRAG index from knowledge base...")
        # Load documents
        try:
            documents = SimpleDirectoryReader("./knowledge_base").load_data()
        except Exception as e:
            print(f"Error loading documents: {e}")
            return None

        # Create Graph Store
        graph_store = SimpleGraphStore()
        storage_context = StorageContext.from_defaults(graph_store=graph_store)

        # Create Knowledge Graph Index
        # This extracts triplets (Subject, Predicate, Object) using the LLM
        # For better performance on larger docs, we might use max_triplets_per_chunk
        index = KnowledgeGraphIndex.from_documents(
            documents,
            max_triplets_per_chunk=2,
            storage_context=storage_context,
            include_embeddings=True # Hybrid search: Graph + Vector
        )
        
        # Persist
        index.storage_context.persist(persist_dir=PERSIST_DIR)
    else:
        print("Loading existing GraphRAG index...")
        storage_context = StorageContext.from_defaults(persist_dir=PERSIST_DIR)
        index = load_index_from_storage(storage_context)

    # Return query engine
    # Use generic query engine or specialized graph query engine?
    # For KnowledgeGraphIndex, we can use standard query engine
    return index.as_query_engine(
        include_text=True, 
        response_mode="tree_summarize", 
        embedding_mode="hybrid", 
        similarity_top_k=5
    )

# Singleton to avoid reloading every request
_query_engine = None

def query_graph_rag(query_text: str):
    global _query_engine
    if _query_engine is None:
        try:
            _query_engine = get_graph_rag_query_engine()
        except Exception as e:
            return f"Error initializing GraphRAG: {str(e)}"
            
    if _query_engine:
        response = _query_engine.query(query_text)
        return str(response)
    else:
        return "GraphRAG engine could not be initialized."
