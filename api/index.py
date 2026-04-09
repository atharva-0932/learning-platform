from flask import Flask, request, jsonify
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from api.utils.resume_parser import parse_resume_pdf
from api.utils.gemini import call_gemini_with_retry
from api.utils.learning_path import get_roadmap_for_role, find_resources, generate_capstone_project, get_roadmapsh_id, fetch_roadmapsh_raw
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

@app.route('/api/learning-path', methods=['GET'])
def get_learning_path():
    if not supabase:
        return jsonify({"error": "Supabase not initialized"}), 500
    
    user_id = request.args.get('user_id')
    print(f"Fetching learning path for user: {user_id}")
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    try:
        # 1. Fetch latest assessment to get target_role and missing_skills
        res = supabase.table('user_assessments')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('created_at', desc=True)\
            .limit(1)\
            .execute()
        
        if not res.data:
            print("No career assessment found.")
            return jsonify({"error": "No career assessment found. Please upload a resume first."}), 404
        
        assessment = res.data[0]
        feedback = assessment.get('feedback') or {}
        target_role = assessment.get('target_role')
        keywords = feedback.get('keywords') or {}
        missing_skills = keywords.get('missing', [])
        
        print(f"Target Role: {target_role}, Missing Skills: {missing_skills}")

        # 2. Fetch user's learning progress
        progress_res = supabase.table('user_learning_progress')\
            .select('milestone_title, completed')\
            .eq('user_id', user_id)\
            .execute()
        
        completed_milestones = [p['milestone_title'] for p in (progress_res.data or []) if p.get('completed')]
        print(f"Completed milestones: {len(completed_milestones)}")

        # 3. Generate Roadmap
        print("Generating roadmap...")
        roadmap = generate_roadmap(target_role, missing_skills)
        if not isinstance(roadmap, list):
            print(f"Warning: roadmap is not a list: {roadmap}")
            roadmap = []
        
        # Enrich roadmap with completion status
        for milestone in roadmap:
            if isinstance(milestone, dict):
                milestone['completed'] = milestone.get('title') in completed_milestones

        # 4. Find Resources for each missing skill (pass target_role for roadmap.sh links)
        print("Finding resources...")
        resources = {skill: find_resources(skill, target_role) for skill in missing_skills}

        # 5. Generate Capstone Project
        print("Generating capstone...")
        capstone = generate_capstone_project(missing_skills)

        print("Learning path generated successfully.")
        return jsonify({
            "target_role": target_role,
            "missing_skills": missing_skills,
            "roadmap": roadmap,
            "resources": resources,
            "capstone": capstone
        }), 200

    except Exception as e:
        print(f"CRITICAL Error in get_learning_path: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/progress', methods=['POST'])
def update_progress():
    if not supabase:
        return jsonify({"error": "Supabase not initialized"}), 500
    
    data = request.json
    user_id = data.get('user_id')
    milestone_title = data.get('milestone_title')
    completed = data.get('completed', True)

    if not user_id or not milestone_title:
        return jsonify({"error": "user_id and milestone_title are required"}), 400

    try:
        if completed:
            res = supabase.table('user_learning_progress').upsert({
                "user_id": user_id,
                "milestone_title": milestone_title,
                "completed": True
            }).execute()
        else:
            res = supabase.table('user_learning_progress')\
                .delete()\
                .eq('user_id', user_id)\
                .eq('milestone_title', milestone_title)\
                .execute()
        
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
            "country": profile_data.get('country'),
            "email": profile_data.get('email'),
            "linkedin_url": profile_data.get('linkedin_url'),
            "education": profile_data.get('education', []),
            "experience": profile_data.get('experience', []),
            "projects": profile_data.get('projects', []),
            "achievements": profile_data.get('achievements', []),
            "certifications": profile_data.get('certifications', []),
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

    try:
        content = call_gemini_with_retry(prompt)
        
        # Handle potential error return from call_gemini_with_retry
        if isinstance(content, dict) and "error" in content:
            return jsonify(content), 500
        
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
    except json.JSONDecodeError as je:
        print(f"JSON Decode Error: {je}")
        print(f"Raw content from Gemini: {content}")
        return jsonify({"error": "Failed to parse AI response as JSON", "details": str(je), "raw": content}), 500
    except Exception as e:
        error_msg = str(e)
        print(f"Assessment error: {error_msg}")
        
        # Check for rate limit error
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            return jsonify({
                "error": "Gemini API rate limit reached. Please wait a minute and try again.",
                "type": "rate_limit"
            }), 429
            
        return jsonify({"error": f"Internal Server Error: {error_msg}"}), 500

@app.route('/api/roadmap', methods=['GET'])
def get_roadmap():
    """Returns roadmap for a target role. Uses assessment if user_id provided, else target_role + missing_skills."""
    if not supabase:
        return jsonify({"error": "Supabase not initialized"}), 500
    user_id = request.args.get('user_id')
    target_role = request.args.get('target_role')
    missing_skills_raw = request.args.get('missing_skills', '[]')

    try:
        missing_skills = []
        if user_id:
            res = supabase.table('user_assessments')\
                .select('*')\
                .eq('user_id', user_id)\
                .order('created_at', desc=True)\
                .limit(1)\
                .execute()
            if res.data:
                feedback = res.data[0].get('feedback') or {}
                keywords = feedback.get('keywords') or {}
                missing_skills = keywords.get('missing', [])
                if not target_role:
                    target_role = res.data[0].get('target_role')
        else:
            try:
                missing_skills = json.loads(missing_skills_raw) if missing_skills_raw else []
            except json.JSONDecodeError:
                pass

        if not target_role:
            return jsonify({"error": "target_role is required (or provide user_id with an assessment)"}), 400

        # Use static roadmaps - no Gemini/AI required
        roadmap = get_roadmap_for_role(target_role)

        if user_id:
            progress_res = supabase.table('user_learning_progress')\
                .select('milestone_title, completed')\
                .eq('user_id', user_id)\
                .execute()
            completed = [p['milestone_title'] for p in (progress_res.data or []) if p.get('completed')]
            for m in roadmap:
                if isinstance(m, dict):
                    m['completed'] = m.get('title') in completed

        roadmap_id = get_roadmapsh_id(target_role)
        roadmap_sh_raw = fetch_roadmapsh_raw(roadmap_id) if roadmap_id else None

        return jsonify({
            "target_role": target_role,
            "roadmap": roadmap,
            "roadmap_sh_url": f"https://roadmap.sh/{roadmap_id}" if roadmap_id else None,
            "roadmap_sh_id": roadmap_id,
            "roadmap_sh_raw": roadmap_sh_raw,
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/job-applications', methods=['GET'])
def get_job_applications():
    if not supabase:
        return jsonify({"error": "Supabase not initialized"}), 500
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    try:
        res = supabase.table('job_applications')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('applied_at', desc=True)\
            .execute()
        return jsonify(res.data or []), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/job-applications', methods=['POST'])
def create_job_application():
    if not supabase:
        return jsonify({"error": "Supabase not initialized"}), 500
    data = request.json
    user_id = data.get('user_id')
    company = data.get('company')
    role = data.get('role')
    if not all([user_id, company, role]):
        return jsonify({"error": "user_id, company, and role are required"}), 400
    try:
        from datetime import datetime, timedelta, timezone
        applied_at = data.get('applied_at')
        if applied_at:
            try:
                applied_dt = datetime.fromisoformat(str(applied_at).replace('Z', '+00:00'))
            except ValueError:
                applied_dt = datetime.now(timezone.utc)
        else:
            applied_dt = datetime.now(timezone.utc)
        optimal = data.get('optimal_follow_up_at')
        if not optimal:
            optimal_dt = applied_dt + timedelta(days=5)
            optimal = optimal_dt.isoformat()
        insert_data = {
            "user_id": user_id,
            "company": company,
            "role": role,
            "applied_at": applied_at if applied_at else applied_dt.isoformat(),
            "status": data.get('status', 'applied'),
            "optimal_follow_up_at": optimal,
            "notes": data.get('notes'),
            "job_url": data.get('job_url'),
            "recruiter_email": data.get('recruiter_email'),
        }
        res = supabase.table('job_applications').insert(insert_data).execute()
        return jsonify(res.data[0] if res.data else insert_data), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/job-applications/<application_id>', methods=['PATCH'])
def update_job_application(application_id):
    if not supabase:
        return jsonify({"error": "Supabase not initialized"}), 500
    data = request.json
    user_id = data.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    try:
        update_fields = {}
        for k in ['company', 'role', 'applied_at', 'status', 'optimal_follow_up_at', 'follow_up_sent', 'notes', 'job_url', 'recruiter_email', 'last_follow_up_at']:
            if k in data:
                update_fields[k] = data[k]
        if not update_fields:
            return jsonify({"error": "No fields to update"}), 400
        res = supabase.table('job_applications')\
            .update(update_fields)\
            .eq('id', application_id)\
            .eq('user_id', user_id)\
            .execute()
        if not res.data:
            return jsonify({"error": "Application not found"}), 404
        return jsonify(res.data[0]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/job-applications/<application_id>', methods=['DELETE'])
def delete_job_application(application_id):
    if not supabase:
        return jsonify({"error": "Supabase not initialized"}), 500
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    try:
        supabase.table('job_applications')\
            .delete()\
            .eq('id', application_id)\
            .eq('user_id', user_id)\
            .execute()
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/job-openings', methods=['POST'])
def job_openings():
    """
    Crew-style job discovery: LinkedIn / Naukri / Glassdoor via search index (SerpAPI or Google CSE),
    ranked by user skills. Requires SERPAPI_KEY or GOOGLE_SEARCH_API_KEY + GOOGLE_SEARCH_CX.
    """
    data = request.json or {}
    target_role = data.get('target_role')
    skills = data.get('skills') or []
    if not target_role or not str(target_role).strip():
        return jsonify({"error": "target_role is required"}), 400
    if not isinstance(skills, list):
        skills = []
    skills = [str(s).strip() for s in skills if s and str(s).strip()]

    try:
        from api.utils.job_search_crew import run_job_search_with_crew
        result = run_job_search_with_crew(str(target_role).strip(), skills)
        return jsonify(result), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


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
