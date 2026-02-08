from flask import Flask, request, jsonify
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from api.utils.resume_parser import parse_resume_pdf
import io

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
