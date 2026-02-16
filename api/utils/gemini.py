import os
from google import genai
import time
import random

def call_gemini_with_retry(prompt, model='gemini-2.0-flash'):
    """
    Calls Gemini with exponential backoff and rotates through multiple API keys if provided.
    """
    api_keys_str = os.getenv("GEMINI_API_KEY", "")
    api_keys = [k.strip() for k in api_keys_str.split(",") if k.strip()]
    
    if not api_keys:
        return {"error": "GEMINI_API_KEY not configured"}

    max_retries = 3
    base_delay = 2
    
    # Randomly shuffle keys to distribute load if multiple keys are provided
    random.shuffle(api_keys)

    for attempt in range(max_retries + 1):
        for api_key in api_keys:
            try:
                client = genai.Client(api_key=api_key)
                response = client.models.generate_content(
                    model=model,
                    contents=prompt
                )
                return response.text
            except Exception as e:
                error_msg = str(e)
                # Check for rate limit error
                if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
                    print(f"Rate limit hit for key ...{api_key[-5:]}. Attempt {attempt+1}/{max_retries+1}")
                    continue # Try next key
                else:
                    raise e
        
        # If we reach here, all keys were rate limited in this attempt
        if attempt < max_retries:
            delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
            print(f"All keys rate limited. Retrying in {delay:.2f} seconds...")
            time.sleep(delay)
    
    raise Exception("Gemini API rate limit reached for all provided keys after retries.")
