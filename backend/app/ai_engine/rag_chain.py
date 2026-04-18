import os
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import PromptTemplate
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_classic.chains import create_retrieval_chain

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
CHROMA_DB_DIR = os.path.join(DATA_DIR, "chromadb")

# Global placeholders for lazy loading
_llm = None
_embedding_model = None

def get_llm():
    """Lazy initializer for the Ollama LLM."""
    global _llm
    if _llm is None:
        print("DEBUG: Initializing Ollama LLM (llama3.2:1b)...")
        # 1. Initialize LLM (Ensure Ollama is running locally)
        from langchain_community.llms import Ollama
        _llm = Ollama(model="llama3.2:1b", temperature=0.1)
    return _llm

def get_embeddings():
    """Lazy initializer for HuggingFace embeddings."""
    global _embedding_model
    if _embedding_model is None:
        print("DEBUG: Initializing HuggingFace Embeddings (all-MiniLM-L6-v2)...")
        # 2. Embedding Model (MUST match what was used during ingestion)
        from langchain_huggingface import HuggingFaceEmbeddings
        _embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    return _embedding_model

# 3. Vector Store Retriever
def get_retriever():
    if not os.path.exists(CHROMA_DB_DIR):
        # Return none or fallback if DB doesn't exist yet
        return None
    
    vectorstore = Chroma(
        persist_directory=CHROMA_DB_DIR, 
        embedding_function=get_embeddings()
    )
    # retrieve top 3 most relevant chunks
    return vectorstore.as_retriever(search_kwargs={"k": 3})

# 4. Prompt Template
system_prompt = (
    "You are the official AI Assistant for the EduSphere Web Portal. "
    "Use ONLY the following context to answer the student's question. "
    "If the answer is not contained in the context, clearly state that you do not "
    "know the answer and advise them to check with the administration. "
    "Be professional, concise, and helpful."
    "\n\nContext:"
    "\n{context}"
)

prompt = PromptTemplate.from_template(system_prompt + "\n\nQuestion: {input}\nAnswer:")

def ask_question(question: str):
    """
    Core function called by the API to process a student's RAG question.
    """
    retriever = get_retriever()
    if not retriever:
        # Fallback if no documents have been uploaded yet
        return get_llm().invoke(f"You are a college assistant. The student asked: {question}. Explain briefly that the college hasn't uploaded any specific knowledge documents yet, but try to give a polite general answer.")
    
    # Create the chains
    question_answer_chain = create_stuff_documents_chain(get_llm(), prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)
    
    # Execute RAG
    print(f"Executing RAG inference for query: {question}")
    response = rag_chain.invoke({"input": question})
    
    return response["answer"]
