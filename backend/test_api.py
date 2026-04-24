import requests
import os
from dotenv import load_dotenv

load_dotenv()

# Test Google AI Studio API
GOOGLE_AI_API_KEY = os.getenv("GOOGLE_AI_API_KEY")
print(f"API Key: {GOOGLE_AI_API_KEY[:10]}...")

# Try different endpoints
endpoints = [
    "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent",
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
    "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent",
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
]

for endpoint in endpoints:
    print(f"\nTesting: {endpoint}")
    try:
        headers = {"Content-Type": "application/json"}
        data = {
            "contents": [{"parts": [{"text": "Hello, can you respond with just 'OK'?"}]}],
            "generationConfig": {"temperature": 0.3}
        }
        
        response = requests.post(
            f"{endpoint}?key={GOOGLE_AI_API_KEY}",
            headers=headers,
            json=data,
            timeout=10
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ SUCCESS - This endpoint works!")
            result = response.json()
            if "candidates" in result:
                print(f"Response: {result['candidates'][0]['content']['parts'][0]['text']}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
