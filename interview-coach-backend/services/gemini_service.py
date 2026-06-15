from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

def analyze_resume(text):

    prompt = f"""
    Analyze this resume.

    Give:
    1. Strengths
    2. Weaknesses
    3. Missing skills
    4. Internship readiness score

    Resume:
    {text}
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text