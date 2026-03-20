import json
import requests
from api.utils.gemini import call_gemini_with_retry

# Maps common role titles to roadmap.sh roadmap IDs
# Full list: https://roadmap.sh/roadmaps
ROADMAP_ID_MAP = {
    # Frontend
    "frontend developer": "frontend",
    "frontend engineer": "frontend",
    "ui developer": "frontend",
    "react developer": "react",
    "vue developer": "vue",
    "angular developer": "angular",
    # Backend
    "backend developer": "backend",
    "backend engineer": "backend",
    "node.js developer": "nodejs",
    "nodejs developer": "nodejs",
    "python developer": "python",
    "java developer": "java",
    "spring boot developer": "spring-boot",
    "golang developer": "golang",
    "rust developer": "rust",
    # Full Stack
    "full stack developer": "full-stack",
    "full stack engineer": "full-stack",
    "full-stack developer": "full-stack",
    "full-stack engineer": "full-stack",
    # DevOps / Cloud / SRE
    "devops engineer": "devops",
    "site reliability engineer": "devops",
    "sre": "devops",
    "cloud engineer": "aws",
    "aws engineer": "aws",
    "platform engineer": "devops",
    # Data / AI / ML
    "data scientist": "data-analyst",
    "data analyst": "data-analyst",
    "data engineer": "data-analyst",
    "machine learning engineer": "mlops",
    "ml engineer": "mlops",
    "ai engineer": "ai-data-scientist",
    "mlops engineer": "mlops",
    # Mobile
    "android developer": "android",
    "ios developer": "ios",
    "react native developer": "react-native",
    "flutter developer": "flutter",
    # Other
    "software engineer": "software-design-architecture",
    "qa engineer": "qa",
    "cyber security engineer": "cyber-security",
    "cybersecurity engineer": "cyber-security",
    "blockchain developer": "blockchain",
    "game developer": "game-developer",
    "ux designer": "ux-design",
    "product manager": "product-manager",
    "technical writer": "technical-writing",
    "system design": "system-design",
}

ROADMAPSH_BASE_URL = "https://raw.githubusercontent.com/kamranahmedse/developer-roadmap/master/public/roadmaps"
# Roadmap.sh stores flowchart data in src/data/roadmaps/{id}/{id}.json
ROADMAPSH_RAW_BASE = "https://raw.githubusercontent.com/kamranahmedse/developer-roadmap/master/src/data/roadmaps"


def get_roadmapsh_id(target_role: str) -> str | None:
    """Maps a target role string to a roadmap.sh roadmap ID."""
    role_lower = target_role.lower().strip()

    # Exact match first
    if role_lower in ROADMAP_ID_MAP:
        return ROADMAP_ID_MAP[role_lower]

    # Partial match (role contains key or key contains role)
    for key, value in ROADMAP_ID_MAP.items():
        if key in role_lower or role_lower in key:
            return value

    return None


def fetch_roadmapsh_raw(roadmap_id: str) -> dict | None:
    """
    Fetches the raw roadmap.sh flowchart JSON (nodes + edges) for a given roadmap ID.
    Returns {"nodes": [...], "edges": [...]} or None if fetch fails.
    """
    url = f"{ROADMAPSH_RAW_BASE}/{roadmap_id}/{roadmap_id}.json"
    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        data = response.json()
        nodes = data.get("nodes", [])
        edges = data.get("edges", [])
        if nodes or edges:
            return {"nodes": nodes, "edges": edges}
        return None
    except requests.exceptions.RequestException as e:
        print(f"Roadmap.sh raw fetch error for {roadmap_id}: {e}")
        return None
    except Exception as e:
        print(f"Roadmap.sh raw parse error for {roadmap_id}: {e}")
        return None


def fetch_roadmapsh_topics(target_role: str) -> list:
    """
    Fetches the roadmap.sh JSON for a given role and extracts topic labels.
    Roadmap.sh stores roadmaps as reactflow node/edge graphs on GitHub.
    Returns a deduplicated list of up to 40 skill/topic names.
    """
    roadmap_id = get_roadmapsh_id(target_role)
    if not roadmap_id:
        print(f"No roadmap.sh ID found for role: {target_role}")
        return []

    url = f"{ROADMAPSH_BASE_URL}/{roadmap_id}.json"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        topics = []

        # Format 1: reactflow nodes/edges (current roadmap.sh format)
        nodes = data.get("nodes", [])
        if nodes:
            for node in nodes:
                node_type = node.get("type", "")
                node_data = node.get("data", {})
                label = node_data.get("label", "").strip()
                # Only include topic/subtopic nodes (not section headers or connectors)
                if label and node_type in ("topic", "subtopic", "link_item", ""):
                    topics.append(label)

        # Format 2: flat groups/items structure (older format)
        elif "groups" in data:
            for group in data.get("groups", []):
                for item in group.get("items", []):
                    title = item.get("title", "").strip()
                    if title:
                        topics.append(title)

        # Format 3: simple items list
        elif isinstance(data, list):
            for item in data:
                title = item.get("title", "").strip()
                if title:
                    topics.append(title)

        # Deduplicate while preserving order, cap at 40
        seen = set()
        unique_topics = []
        for t in topics:
            if t not in seen:
                seen.add(t)
                unique_topics.append(t)

        print(f"Fetched {len(unique_topics)} topics from roadmap.sh for: {target_role} (id: {roadmap_id})")
        return unique_topics[:40]

    except requests.exceptions.RequestException as e:
        print(f"Roadmap.sh network error for {roadmap_id}: {e}")
        return []
    except Exception as e:
        print(f"Roadmap.sh parse error for {roadmap_id}: {e}")
        return []


def find_resources(skill: str, target_role: str = None) -> list:
    """
    Returns curated high-quality learning links for a given skill.
    Augmented with a roadmap.sh link when a matching roadmap exists.
    """
    resource_map = {
        "react": [
            {"title": "Official React Documentation", "url": "https://react.dev/"},
            {"title": "Kent C. Dodds - Epic React", "url": "https://epicreact.dev/"},
            {"title": "FreeCodeCamp - React Course", "url": "https://www.youtube.com/watch?v=bMknfKXIFA8"},
        ],
        "node": [
            {"title": "Node.js Documentation", "url": "https://nodejs.org/en/docs/"},
            {"title": "MDN - Express/Node Tutorial", "url": "https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs"},
            {"title": "Node.js Best Practices", "url": "https://github.com/goldbergyoni/nodebestpractices"},
        ],
        "nodejs": [
            {"title": "Node.js Documentation", "url": "https://nodejs.org/en/docs/"},
            {"title": "Node.js Best Practices", "url": "https://github.com/goldbergyoni/nodebestpractices"},
        ],
        "python": [
            {"title": "Official Python Tutorial", "url": "https://docs.python.org/3/tutorial/"},
            {"title": "Real Python", "url": "https://realpython.com/"},
            {"title": "Python for Beginners (YouTube)", "url": "https://www.youtube.com/watch?v=_uQrJ0TkZlc"},
        ],
        "typescript": [
            {"title": "TypeScript Handbook", "url": "https://www.typescriptlang.org/docs/handbook/intro.html"},
            {"title": "Total TypeScript", "url": "https://www.totaltypescript.com/"},
            {"title": "TypeScript Deep Dive", "url": "https://basarat.gitbook.io/typescript/"},
        ],
        "javascript": [
            {"title": "MDN JavaScript Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide"},
            {"title": "javascript.info - The Modern JS Tutorial", "url": "https://javascript.info/"},
            {"title": "Eloquent JavaScript (Free Book)", "url": "https://eloquentjavascript.net/"},
        ],
        "docker": [
            {"title": "Docker Get Started", "url": "https://docs.docker.com/get-started/"},
            {"title": "Docker Tutorial for Beginners", "url": "https://www.youtube.com/watch?v=pg19Z8LL06w"},
        ],
        "kubernetes": [
            {"title": "Kubernetes Basics", "url": "https://kubernetes.io/docs/tutorials/kubernetes-basics/"},
            {"title": "Nana - Kubernetes Tutorial", "url": "https://www.youtube.com/watch?v=X48VuDVv0do"},
        ],
        "nextjs": [
            {"title": "Next.js Documentation", "url": "https://nextjs.org/docs"},
            {"title": "Next.js Learn Course", "url": "https://nextjs.org/learn"},
        ],
        "html": [
            {"title": "MDN HTML Reference", "url": "https://developer.mozilla.org/en-US/docs/Web/HTML"},
            {"title": "HTML Full Course - freeCodeCamp", "url": "https://www.youtube.com/watch?v=pQN-pnXPaVg"},
        ],
        "css": [
            {"title": "MDN CSS Reference", "url": "https://developer.mozilla.org/en-US/docs/Web/CSS"},
            {"title": "CSS-Tricks", "url": "https://css-tricks.com/"},
            {"title": "Flexbox Froggy", "url": "https://flexboxfroggy.com/"},
        ],
        "sql": [
            {"title": "SQLZoo - Interactive SQL", "url": "https://sqlzoo.net/"},
            {"title": "PostgreSQL Tutorial", "url": "https://www.postgresqltutorial.com/"},
        ],
        "postgresql": [
            {"title": "Official PostgreSQL Docs", "url": "https://www.postgresql.org/docs/"},
            {"title": "PostgreSQL Tutorial", "url": "https://www.postgresqltutorial.com/"},
        ],
        "mongodb": [
            {"title": "MongoDB University (Free)", "url": "https://learn.mongodb.com/"},
            {"title": "MongoDB Documentation", "url": "https://www.mongodb.com/docs/"},
        ],
        "redis": [
            {"title": "Redis Documentation", "url": "https://redis.io/docs/"},
            {"title": "Redis University", "url": "https://university.redis.com/"},
        ],
        "aws": [
            {"title": "AWS Free Tier & Docs", "url": "https://aws.amazon.com/free/"},
            {"title": "AWS Skill Builder", "url": "https://skillbuilder.aws/"},
        ],
        "graphql": [
            {"title": "GraphQL Official Docs", "url": "https://graphql.org/learn/"},
            {"title": "How to GraphQL", "url": "https://www.howtographql.com/"},
        ],
        "git": [
            {"title": "Pro Git Book (Free)", "url": "https://git-scm.com/book/en/v2"},
            {"title": "Learn Git Branching (Interactive)", "url": "https://learngitbranching.js.org/"},
        ],
        "system design": [
            {"title": "System Design Primer", "url": "https://github.com/donnemartin/system-design-primer"},
            {"title": "Grokking System Design", "url": "https://www.educative.io/courses/grokking-modern-system-design-interview-for-engineers-managers"},
        ],
        "machine learning": [
            {"title": "fast.ai - Practical Deep Learning", "url": "https://course.fast.ai/"},
            {"title": "Google ML Crash Course", "url": "https://developers.google.com/machine-learning/crash-course"},
        ],
        "data structures": [
            {"title": "Visualgo - Visual Algorithms", "url": "https://visualgo.net/en"},
            {"title": "NeetCode - DSA Roadmap", "url": "https://neetcode.io/roadmap"},
        ],
        "algorithms": [
            {"title": "NeetCode - DSA Roadmap", "url": "https://neetcode.io/roadmap"},
            {"title": "LeetCode", "url": "https://leetcode.com/"},
        ],
    }

    skill_lower = skill.lower().strip()
    resources = list(resource_map.get(skill_lower, []))

    # Roadmap.sh deep link for the role
    if target_role:
        roadmap_id = get_roadmapsh_id(target_role)
        if roadmap_id:
            roadmap_url = f"https://roadmap.sh/{roadmap_id}"
            resources.append({
                "title": f"Roadmap.sh — Official {target_role} Path",
                "url": roadmap_url,
            })

    # Generic fallback if we found nothing
    if not resources:
        resources = [
            {"title": f"Search '{skill}' on MDN", "url": f"https://developer.mozilla.org/en-US/search?q={skill}"},
            {"title": f"{skill} on freeCodeCamp", "url": f"https://www.freecodecamp.org/news/search/?query={skill}"},
        ]
        if target_role:
            roadmap_id = get_roadmapsh_id(target_role)
            if roadmap_id:
                resources.append({
                    "title": f"Roadmap.sh — Official {target_role} Path",
                    "url": f"https://roadmap.sh/{roadmap_id}",
                })

    return resources


# Fallback roadmaps when Gemini fails (rate limit, etc.)
FALLBACK_ROADMAPS: dict[str, list[dict]] = {
    "frontend": [
        {"title": "Week 1: HTML & CSS Foundations", "description": "Master semantic HTML and responsive CSS. Build a simple portfolio page.", "difficulty": "Beginner"},
        {"title": "Week 2: JavaScript Fundamentals", "description": "Learn variables, functions, DOM manipulation, and async/await.", "difficulty": "Beginner"},
        {"title": "Week 3: React or Vue Basics", "description": "Pick a framework. Learn components, state, and props.", "difficulty": "Intermediate"},
        {"title": "Week 4: Build a Project", "description": "Create a full project: todo app, weather app, or portfolio with API integration.", "difficulty": "Intermediate"},
    ],
    "backend": [
        {"title": "Week 1: Language & Basics", "description": "Choose Python, Node.js, or Go. Learn syntax, packages, and HTTP basics.", "difficulty": "Beginner"},
        {"title": "Week 2: Databases & SQL", "description": "Learn PostgreSQL or MongoDB. CRUD operations and basic queries.", "difficulty": "Beginner"},
        {"title": "Week 3: REST APIs", "description": "Build a REST API with authentication. Use Express, FastAPI, or similar.", "difficulty": "Intermediate"},
        {"title": "Week 4: Deploy & Integrate", "description": "Deploy to Railway, Render, or Vercel. Add tests and error handling.", "difficulty": "Intermediate"},
    ],
    "full-stack": [
        {"title": "Week 1: Frontend Foundations", "description": "HTML, CSS, JavaScript. Build a static landing page.", "difficulty": "Beginner"},
        {"title": "Week 2: Backend & Database", "description": "Set up a server and database. Create a simple API.", "difficulty": "Beginner"},
        {"title": "Week 3: Connect Frontend & Backend", "description": "Fetch data from API. Add forms and state management.", "difficulty": "Intermediate"},
        {"title": "Week 4: Full Project", "description": "Build a complete app: auth, CRUD, and deploy.", "difficulty": "Intermediate"},
    ],
    "devops": [
        {"title": "Week 1: Linux & Shell", "description": "Learn Linux basics, bash scripting, and file systems.", "difficulty": "Beginner"},
        {"title": "Week 2: Docker & Containers", "description": "Docker images, Dockerfile, docker-compose.", "difficulty": "Beginner"},
        {"title": "Week 3: CI/CD Basics", "description": "GitHub Actions or GitLab CI. Automate build and deploy.", "difficulty": "Intermediate"},
        {"title": "Week 4: Kubernetes Intro", "description": "Pods, deployments, services. Deploy a simple app.", "difficulty": "Intermediate"},
    ],
    "data-analyst": [
        {"title": "Week 1: SQL & Data Basics", "description": "SELECT, JOIN, GROUP BY. Practice on sample datasets.", "difficulty": "Beginner"},
        {"title": "Week 2: Python for Data", "description": "Pandas, NumPy. Load, clean, and analyze data.", "difficulty": "Beginner"},
        {"title": "Week 3: Visualization", "description": "Matplotlib, Seaborn, or Tableau. Create dashboards.", "difficulty": "Intermediate"},
        {"title": "Week 4: Project", "description": "End-to-end analysis: define question, get data, analyze, present.", "difficulty": "Intermediate"},
    ],
}


def get_roadmap_for_role(target_role: str) -> list:
    """
    Returns roadmap for a target role. No AI/Gemini - uses static roadmaps only.
    Matches roadmap.sh structure for common roles.
    """
    import copy
    rid = get_roadmapsh_id(target_role)
    if rid and rid in FALLBACK_ROADMAPS:
        return copy.deepcopy(FALLBACK_ROADMAPS[rid])
    # Generic fallback for unmapped roles
    return [
        {"title": "Week 1: Foundations", "description": "Learn the core concepts and fundamentals for this role.", "difficulty": "Beginner"},
        {"title": "Week 2: Core Skills", "description": "Build on basics. Practice key skills and tools.", "difficulty": "Beginner"},
        {"title": "Week 3: Intermediate Topics", "description": "Tackle more advanced concepts and integrations.", "difficulty": "Intermediate"},
        {"title": "Week 4: Project", "description": "Apply everything in a real project or portfolio piece.", "difficulty": "Intermediate"},
    ]


def _get_fallback_roadmap(target_role: str) -> list:
    """Alias for get_roadmap_for_role - used when Gemini fails."""
    return get_roadmap_for_role(target_role)


def generate_roadmap(target_role: str, missing_skills: list) -> list:
    """
    Uses Gemini to create a structured 30-day learning path.
    Injects roadmap.sh topic data as structured context to ground the output.
    """
    # Fetch authoritative topic list from roadmap.sh
    roadmapsh_topics = fetch_roadmapsh_topics(target_role)

    roadmap_context = ""
    if roadmapsh_topics:
        roadmap_context = f"""
    Reference Curriculum (from roadmap.sh for {target_role}):
    These are the industry-standard topics for this role — use them to ensure the milestones are
    comprehensive and correctly sequenced, but focus the content on the user's specific missing skills:
    {', '.join(roadmapsh_topics)}
    """

    prompt = f"""
    Create a highly personalized 30-day learning roadmap for someone aiming to become a {target_role}.
    Their missing skills are: {', '.join(missing_skills)}
    {roadmap_context}

    Requirements:
    1. The roadmap must be progressive (fundamentals BEFORE advanced topics).
    2. Divide it into exactly 4 weekly milestones (Week 1–4).
    3. Each milestone should directly address one or more of the missing skills.
    4. Return ONLY a JSON array with the following structure:
       [
         {{
           "title": "Week 1: Foundations of X",
           "description": "Short description of what to learn and why.",
           "difficulty": "Beginner" | "Intermediate" | "Advanced"
         }}
       ]

    Return ONLY the JSON array, no markdown, no extra text.
    """

    try:
        content = call_gemini_with_retry(prompt)

        # Handle error dict from call_gemini_with_retry
        if isinstance(content, dict) and "error" in content:
            print(f"Roadmap Gemini error: {content.get('error')}")
            return _get_fallback_roadmap(target_role)

        # Strip markdown code fences if present
        if isinstance(content, str):
            if "```json" in content:
                content = content.split("```json", 1)[1].split("```", 1)[0]
            elif "```" in content:
                content = content.split("```", 1)[1].split("```", 1)[0]
            result = json.loads(content.strip())
            if isinstance(result, list) and len(result) > 0:
                return result
        return _get_fallback_roadmap(target_role)
    except Exception as e:
        print(f"Roadmap generation error: {e}")
        return _get_fallback_roadmap(target_role)


def generate_capstone_project(missing_skills: list) -> dict | None:
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

        if "```json" in content:
            content = content.split("```json", 1)[1].split("```", 1)[0]
        elif "```" in content:
            content = content.split("```", 1)[1].split("```", 1)[0]

        return json.loads(content.strip())
    except Exception as e:
        print(f"Capstone generation error: {e}")
        return None
