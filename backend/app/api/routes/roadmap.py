from fastapi import APIRouter, Depends, HTTPException
from app.schemas import schemas
from app.database import models
from app.api.dependencies import get_current_student

router = APIRouter()

def build_roadmap_prompt(topic: str, skill_level: str, deadline_weeks: int, daily_hours: float) -> str:
    return f"""You are an expert academic coach and curriculum designer. Generate a detailed, structured {deadline_weeks}-week study roadmap for the following:

Topic: {topic}
Student Level: {skill_level}
Study Time Available: {daily_hours} hours per day
Total Duration: {deadline_weeks} weeks

Format your response EXACTLY as follows:

📚 STUDY ROADMAP: {topic.upper()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 GOAL OVERVIEW
[Write 2-3 sentences about what the student will achieve]

📋 PREREQUISITES
• [Prerequisite 1]
• [Prerequisite 2]
(List "None" if beginner-friendly)

{''.join([f'''
WEEK {w}: [WEEK {w} THEME TITLE]
─────────────────────────────
📖 Topics to Cover:
  • [Topic 1]
  • [Topic 2]
  • [Topic 3]

🛠 Practice Tasks:
  • [Task 1]
  • [Task 2]

⏱ Estimated Time: {daily_hours * 7:.0f} hours
''' for w in range(1, deadline_weeks + 1)])}

🔗 RECOMMENDED RESOURCES
• [Resource 1 - Free/Paid]
• [Resource 2 - Book/Website/Course]
• [Resource 3]

✅ SUCCESS MILESTONES
• By Week {deadline_weeks // 2}: [Mid-point milestone]
• By Week {deadline_weeks}: [Final milestone]

💡 PRO TIPS
• [Tip 1 specific to {topic}]
• [Tip 2]
"""

@router.post("/generate")
def generate_roadmap(
    request: schemas.RoadmapRequest,
    current_user: models.User = Depends(get_current_student)
):
    """Generate an AI-powered study roadmap using the local Ollama model."""
    try:
        import requests as http_requests
        
        prompt = build_roadmap_prompt(
            request.topic,
            request.skill_level,
            request.deadline_weeks,
            request.daily_hours
        )
        
        # Call Ollama local model
        response = http_requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3.2",  # use available model
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "num_predict": 1500
                }
            },
            timeout=120
        )
        
        if response.status_code == 200:
            result = response.json()
            roadmap_text = result.get("response", "").strip()
            return {
                "topic": request.topic,
                "skill_level": request.skill_level,
                "deadline_weeks": request.deadline_weeks,
                "daily_hours": request.daily_hours,
                "roadmap": roadmap_text,
                "generated_by": "Ollama AI"
            }
        else:
            raise HTTPException(status_code=503, detail="AI model unavailable. Make sure Ollama is running.")
            
    except http_requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=503,
            detail="Cannot connect to Ollama. Please ensure it is running on port 11434."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Roadmap generation failed: {str(e)}")
