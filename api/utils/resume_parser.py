import os
import fitz  # PyMuPDF
from google import genai
import json

def parse_resume_pdf(file_buffer):
    """
    Parses a PDF buffer using PyMuPDF and extracts structured data using Google Gemini.
    """
    try:
        # Extract text from PDF
        doc = fitz.open(stream=file_buffer, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        
        if not text:
            return {"error": "No text content found in PDF"}

        prompt = f"""
        You are an AI assistant that extracts structured data from resumes.
        Extract the following information from the text below and return it as a valid JSON object:
        - full_name: the person's full name (string)
        - email: email address (string)
        - country: city and/or country (string)
        - linkedin_url: LinkedIn profile URL (string)
        - skills: list of strings (e.g., ["Python", "React", "Project Management"])
        - education: list of objects with fields "degree", "institution", "year"
        - experience: list of objects with fields "role", "company", "duration", "description"
        - bio: a short professional summary (string)

        Resume Text:
        {text}
        
        Return ONLY the JSON object, no markdown formatting.
        """

        from api.utils.gemini import call_gemini_with_retry
        content = call_gemini_with_retry(prompt)
        
        # Handle potential error return from call_gemini_with_retry
        if isinstance(content, dict) and "error" in content:
            return content
        
        # Clean up potential markdown code blocks
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
            
        result = json.loads(content.strip())
        result["raw_text"] = text
        return result

    except Exception as e:
        print(f"Error parsing resume: {e}")
        return {"error": str(e)}
