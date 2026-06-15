from dotenv import load_dotenv
from google import genai
import os

load_dotenv()

key = os.getenv("GEMINI_API_KEY")
print("KEY =", key)

client = genai.Client(api_key=key)

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Hello"
)

print(response.text)