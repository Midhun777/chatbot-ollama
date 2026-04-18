import re

def classify_intent(question: str) -> str:
    """
    Classifies a user question into one of two categories:
    - 'PERSONAL': Questions about marks, attendance, fees, profile.
    - 'KNOWLEDGE': Questions about syllabus, college rules, placements, events.

    In a production system this could use an LLM or Zero-Shot classifier, 
    but for speed and local efficiency, a robust regex/keyword approach is used first.
    """
    question_lower = question.lower()

    # Keywords strictly related to database structured records
    personal_keywords = [
        "my marks", "my attendance", "my fee", "my grade", "my cgpa", 
        "i got in", "how much did i score", "am i present", "my profile",
        "my timetable", "my classes"
    ]

    for kw in personal_keywords:
        if kw in question_lower:
            return "PERSONAL"

    # Default to RAG for general knowledge queries
    return "KNOWLEDGE"
