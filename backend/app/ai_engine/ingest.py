import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

# Configuration paths
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "scripts", "data")
KNOWLEDGE_DIR = os.path.join(DATA_DIR, "knowledge")
CHROMA_DB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "chromadb")

embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

def ingest_pdf(file_path: str):
    """
    Extracts text from a single PDF, chunks it, and saves to ChromaDB.
    """
    if not os.path.exists(CHROMA_DB_DIR):
        os.makedirs(CHROMA_DB_DIR)

    # 1. Load PDF
    loader = PyPDFLoader(file_path)
    pages = loader.load()

    # 2. Split Document into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        length_function=len,
    )
    chunks = text_splitter.split_documents(pages)

    # 3. Embed & Store
    print(f"Ingesting {len(chunks)} chunks from {file_path} into ChromaDB...")
    
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embedding_model,
        persist_directory=CHROMA_DB_DIR
    )
    vectorstore.persist()
    print("Ingestion complete successfully.")
    
    return len(chunks)

def ingest_all_knowledge(db=None):
    """Batch processes all PDFs in the data/knowledge folder and syncs DB records."""
    total_chunks = 0
    
    # 1. Process PDFs
    if os.path.exists(KNOWLEDGE_DIR):
        for file in os.listdir(KNOWLEDGE_DIR):
            if file.endswith(".pdf"):
                path = os.path.join(KNOWLEDGE_DIR, file)
                chunks = ingest_pdf(path)
                total_chunks += chunks
    else:
        print(f"Knowledge directory {KNOWLEDGE_DIR} missing.")

    # 2. Sync Database Records (if DB session provided)
    if db:
        from app.ai_engine.db_ingest import ingest_database_records
        db_chunks = ingest_database_records(db, embedding_model)
        total_chunks += db_chunks
            
    return total_chunks

if __name__ == "__main__":
    ingest_all_knowledge()
