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

        # Configure Gemini
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return {"error": "GEMINI_API_KEY not configured"}
        
        # Use new google.genai Client API
        client = genai.Client(api_key=api_key)

        prompt = f"""
        You are an AI assistant that extracts structured data from resumes.
        Extract the following information from the text below and return it as a valid JSON object:
        - skills: list of strings (e.g., ["Python", "React", "Project Management"])
        - education: list of objects with fields "degree", "institution", "year"
        - experience: list of objects with fields "role", "company", "duration", "description"
        - bio: a short professional summary (string)

        Resume Text:
        {text}
        
        Return ONLY the JSON object, no markdown formatting.
        """

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        content = response.text
        
        # Clean up potential markdown code blocks
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
            
        return json.loads(content.strip())

    except Exception as e:
        print(f"Error parsing resume: {e}")
        return {"error": str(e)}
