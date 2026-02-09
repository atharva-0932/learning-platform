from flask import Flask, request, jsonify
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from api.utils.resume_parser import parse_resume_pdf
from google import genai
import io
import json

load_dotenv(dotenv_path=".env.local")

app = Flask(__name__)

url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not url or not key:
    print(f"Warning: Supabase credentials not found. URL: {url}, Key: {key}")

# Initialize Supabase client
supabase: Client = create_client(url, key) if url and key else None

@app.route('/api/sync-profile', methods=['POST'])
def sync_profile():
    if not supabase:
        return jsonify({"error": "Server misconfiguration: Supabase client not initialized"}), 500

    data = request.json
    user_id = data.get('user_id')
    profile_data = data.get('profile', {})
    skills_list = data.get('skills', [])

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    try:
        # 1. Upsert Profile
        profile_update = {
            "user_id": user_id,
            "full_name": profile_data.get('full_name'),
            "bio": profile_data.get('bio'),
            "education": profile_data.get('education', []),
            "goals": profile_data.get('goals', []),
            "resume_text": profile_data.get('resume_text'),
            "updated_at": "now()"
        }
        
        # Check if profile exists to determine insert vs update (or just use upsert)
        # Using upsert with ON CONFLICT on user_id
        res = supabase.table('profiles').upsert(profile_update).execute()

        # 2. Handle Skills
        # First, ensure all skills exist in the 'skills' table
        skill_ids = []
        for skill_name in skills_list:
            # Normalize skill name
            skill_name = skill_name.strip()
            
            # Try to find existing skill
            existing = supabase.table('skills').select('id').eq('name', skill_name).execute()
            
            if existing.data:
                skill_ids.append(existing.data[0]['id'])
            else:
                # Create new skill
                new_skill = supabase.table('skills').insert({"name": skill_name}).execute()
                if new_skill.data:
                    skill_ids.append(new_skill.data[0]['id'])

        # 3. Update User Skills (Junction Table)
        # For simplicity, we can delete existing user skills and re-insert (full sync)
        
        supabase.table('user_skills').delete().eq('user_id', user_id).execute()
        
        # Use simple integer for proficiency (e.g., 3) if not provided
        user_skills_data = [{"user_id": user_id, "skill_id": sid, "proficiency": 3} for sid in skill_ids]
        
        if user_skills_data:
            supabase.table('user_skills').insert(user_skills_data).execute()

        return jsonify({"success": True, "message": "Profile synced successfully"}), 200

    except Exception as e:
        print(f"Sync error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/career-assessment', methods=['POST'])
def career_assessment():
    if not supabase:
        return jsonify({"error": "Server misconfiguration: Supabase client not initialized"}), 500

    data = request.json
    user_id = data.get('user_id')
    target_role = data.get('target_role')
    resume_text = data.get('resume_text')

    if not all([user_id, target_role, resume_text]):
        return jsonify({"error": "user_id, target_role, and resume_text are required"}), 400

    # Configure Gemini
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return jsonify({"error": "GEMINI_API_KEY not configured"}), 500
    
    try:
        client = genai.Client(api_key=api_key)

        prompt = f"""
        Analyze the match between this resume and the target role.
        Target Role: {target_role}
        Resume Text: {resume_text}

        Generate a detailed assessment and return it as a valid JSON object with the following structure:
        {{
          "score": integer (0-100, the match percentage),
          "verdict": "A 2-sentence executive summary highlighting key strengths and the biggest gap.",
          "keywords": {{
            "present": ["list", "of", "keywords", "from", "the", "role", "found", "in", "resume"],
            "missing": ["list", "of", "keywords", "from", "the", "role", "NOT", "found", "in", "resume"]
          }},
          "skill_gaps": [
            {{ "skill": "Skill Name", "gap_score": integer (1-10, how weak they are), "impact": "High Impact" or "Medium Impact" or "Low Impact" }}
          ],
          "pivot_careers": {{
            "alternatives": [
              {{ "role": "Role Name", "match": integer (0-100) }}
            ],
            "trending": [
              {{ "role": "Role Name", "description": "Why this is trending for them" }}
            ]
          }}
        }}

        Return ONLY the JSON object, no markdown formatting.
        """

        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt
        )
        content = response.text
        
        # Clean up potential markdown code blocks
        if content.startswith("```json"):
            content = content[7:]
        if content.strip().endswith("```"):
            content = content.strip()[:-3]
        
        assessment_data = json.loads(content.strip())

        # Save to user_assessments table
        upsert_data = {
            "user_id": user_id,
            "target_role": target_role,
            "resume_text": resume_text,
            "score": assessment_data.get('score'),
            "feedback": assessment_data,
            "created_at": "now()"
        }

        # We keep multiple assessments (history) or just upsert the latest one?
        # User requested "assessment to be done on the resume and target role input"
        # Let's insert as a new record to keep history, or update if user prefers.
        # Given the existing page.tsx selects the latest one, insert is fine.
        res = supabase.table('user_assessments').insert(upsert_data).execute()

        return jsonify(assessment_data), 200

    except Exception as e:
        error_msg = str(e)
        print(f"Assessment error: {error_msg}")
        
        # Check for rate limit error
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            return jsonify({
                "error": "Gemini API rate limit reached. Please wait a minute and try again.",
                "type": "rate_limit"
            }), 429
            
        return jsonify({"error": error_msg}), 500

@app.route('/api/parse-resume', methods=['POST'])
def parse_resume():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        try:
            # Read file into buffer
            file_buffer = file.read()
            # Parse
            extracted_data = parse_resume_pdf(file_buffer)
            return jsonify(extracted_data), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5328, debug=True)
