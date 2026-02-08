import requests
import json

BASE_URL = "http://127.0.0.1:5328/api"

def test_sync_profile():
    print("Testing /api/sync-profile...")
    payload = {
        "user_id": "test-user-id", # This will likely fail constraint if user doesn't exist in auth.users, but checking for 500 vs 400 is useful
        "profile": {
            "full_name": "Test User",
            "bio": "A test bio",
            "education": [{"degree": "BS CS", "institution": "Test Univ", "year": "2024"}]
        },
        "skills": ["Python", "Flask", "Supabase"]
    }
    try:
        response = requests.post(f"{BASE_URL}/sync-profile", json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_sync_profile()
