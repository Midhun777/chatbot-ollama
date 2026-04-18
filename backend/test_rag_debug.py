import os
import sys

# Add the parent directory to sys.path to allow imports from app and ai_engine
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.ai_engine import rag_chain

try:
    print("Attempting to ask a question via RAG...")
    answer = rag_chain.ask_question("What is the college name?")
    print(f"Answer: {answer}")
except Exception as e:
    import traceback
    print("CAUGHT ERROR IN RAG CHAIN:")
    traceback.print_exc()
