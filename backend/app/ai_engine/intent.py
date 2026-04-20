import re

def classify_intent(question: str) -> str:
    """
    Classifies a user question into specialized intents.
    """
    question_lower = question.lower()

    # 1. Greetings and chitchat
    greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "namaste", "hola"]
    if any(question_lower == g or question_lower.startswith(g + " ") for g in greetings):
        return "GREETING"

    # 1.5. Catalog Inquiries (What courses? List subjects? etc.)
    catalog_keywords = [
        "what course", "list course", "available course", "which subject", 
        "list subject", "course catalog", "what are the courses", "all courses", 
        "provide course", "courses provided", "which are the courses", "subjects offered"
    ]
    if any(kw in question_lower for kw in catalog_keywords):
        return "CATALOG_INQUIRY"

    # 1.6. Faculty Inquiries (How many teachers? List faculty? etc.)
    faculty_keywords = ["how many faculty", "list faculty", "faculty directory", "who are the teachers", "list teachers", "how many teachers", "faculty members", "professors"]
    if any(kw in question_lower for kw in faculty_keywords):
        return "FACULTY_INQUIRY"

    # 1.7. Admission Inquiries (How to join? Admission process? etc.)
    admission_keywords = ["admission", "enrollment", "how to join", "apply for course", "application process", "admission procedure", "how to apply"]
    if any(kw in question_lower for kw in admission_keywords):
        return "ADMISSION_INQUIRY"

    # 2. Personal keywords
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
