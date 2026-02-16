import json
from api.utils.gemini import call_gemini_with_retry

def find_resources(skill):
    """
    Returns curated high-quality learning links for a given skill.
    In a real app, this could be a search API or a database of curated links.
    """
    # Simple curated mapping for common tech skills
    resource_map = {
        "react": [
            {"title": "Official React Documentation", "url": "https://react.dev/"},
            {"title": "Kent C. Dodds - Epic React", "url": "https://epicreact.dev/"},
            {"title": "FreeCodeCamp - React Course", "url": "https://www.youtube.com/watch?v=bMknfKXIFA8"}
        ],
        "node": [
            {"title": "Node.js Documentation", "url": "https://nodejs.org/en/docs/"},
            {"title": "MDN - Express/Node tutorial", "url": "https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs"},
            {"title": "Node.js Best Practices", "url": "https://github.com/goldbergyoni/nodebestpractices"}
        ],
        "python": [
            {"title": "Official Python Tutorial", "url": "https://docs.python.org/3/tutorial/"},
            {"title": "Real Python", "url": "https://realpython.com/"},
            {"title": "Python for Beginners (YouTube)", "url": "https://www.youtube.com/watch?v=_uQrJ0TkZlc"}
        ],
        "typescript": [
            {"title": "TypeScript Handbook", "url": "https://www.typescriptlang.org/docs/handbook/intro.html"},
            {"title": "Total TypeScript", "url": "https://www.totaltypescript.com/"}
        ],
        "docker": [
            {"title": "Docker Get Started", "url": "https://docs.docker.com/get-started/"},
            {"title": "Docker Tutorial for Beginners", "url": "https://www.youtube.com/watch?v=pg19Z8LL06w"}
        ],
        "kubernetes": [
            {"title": "Kubernetes Basics", "url": "https://kubernetes.io/docs/tutorials/kubernetes-basics/"},
            {"title": "Nana - Kubernetes Tutorial", "url": "https://www.youtube.com/watch?v=X48VuDVv0do"}
        ],
        "nextjs": [
            {"title": "Next.js Documentation", "url": "https://nextjs.org/docs"},
            {"title": "Next.js Learn", "url": "https://nextjs.org/learn"}
        ]
    }
    
    skill_lower = skill.lower().strip()
    return resource_map.get(skill_lower, [
        {"title": f"Search for {skill} on MDN", "url": f"https://developer.mozilla.org/en-US/search?q={skill}"},
        {"title": f"{skill} Official Website", "url": f"https://www.google.com/search?q={skill}+official+site"}
    ])

def generate_roadmap(target_role, missing_skills):
    """
    Uses Gemini to create a structured 30-day learning path.
    """
    prompt = f"""
    Create a highly personalized 30-day learning roadmap for someone aiming to become a {target_role}.
    Missing Skills: {', '.join(missing_skills)}
    
    Requirements:
    1. The roadmap must be progressive (e.g., fundamentals BEFORE advanced tools).
    2. Divide it into exactly 4 weekly milestones (or 3-5 major milestones).
    3. Return ONLY a JSON array of objects with the following structure:
       [
         {{
           "title": "Week 1: Foundations of X",
           "description": "Short description of what to learn and why.",
           "difficulty": "Beginner" | "Intermediate" | "Advanced"
         }}
       ]
    
    Ensure the path bridges the gap between their current missing skills and the target role effectively.
    Return ONLY the JSON array, no markdown.
    """
    
    try:
        content = call_gemini_with_retry(prompt)
        
        # Clean up potential markdown code blocks
        if content.startswith("```json"):
            content = content[7:]
        if content.strip().endswith("```"):
            content = content.strip()[:-3]
            
        return json.loads(content.strip())
    except Exception as e:
        print(f"Roadmap generation error: {e}")
        return []

def generate_capstone_project(missing_skills):
    """
    Suggests a complex capstone project that combines multiple missing skills.
    """
    prompt = f"""
    Suggest a single, complex capstone project idea that helps a student practice these missing skills: {', '.join(missing_skills)}.
    The project should be a meaningful portfolio piece.
    
    Return ONLY a JSON object with this structure:
    {{
      "title": "Project Title",
      "description": "Detailed description of the project.",
      "technologies": ["list", "of", "technologies"],
      "learning_outcomes": ["point 1", "point 2"]
    }}
    
    Return ONLY the JSON object, no markdown.
    """
    
    try:
        content = call_gemini_with_retry(prompt)
        
        # Clean up potential markdown code blocks
        if content.startswith("```json"):
            content = content[7:]
        if content.strip().endswith("```"):
            content = content.strip()[:-3]
            
        return json.loads(content.strip())
    except Exception as e:
        print(f"Capstone generation error: {e}")
        return None
