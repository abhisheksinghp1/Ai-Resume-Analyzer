import requests
import os
from dotenv import load_dotenv

load_dotenv()

# List available models
GOOGLE_AI_API_KEY = os.getenv("GOOGLE_AI_API_KEY")
print(f"API Key: {GOOGLE_AI_API_KEY[:10]}...")

# Try to list models for both API versions
endpoints = [
    "https://generativelanguage.googleapis.com/v1/models",
    "https://generativelanguage.googleapis.com/v1beta/models"
]

for endpoint in endpoints:
    print(f"\n=== Testing: {endpoint} ===")
    try:
        response = requests.get(f"{endpoint}?key={GOOGLE_AI_API_KEY}", timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            models = response.json()
            print("✅ Available models:")
            if "models" in models:
                for model in models["models"]:
                    name = model.get("name", "Unknown")
                    supported_methods = model.get("supportedGenerationMethods", [])
                    print(f"  - {name}")
                    print(f"    Methods: {supported_methods}")
            else:
                print(f"Response: {models}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")

# Also try a simple text generation with different approach
print(f"\n=== Testing text generation with different format ===")
try:
    # Try the older format
    url = "https://generativelanguage.googleapis.com/v1beta/models/text-bison-001:generateText"
    headers = {"Content-Type": "application/json"}
    data = {
        "prompt": "Hello, respond with just 'OK'",
        "temperature": 0.3,
        "candidateCount": 1
    }
    
    response = requests.post(f"{url}?key={GOOGLE_AI_API_KEY}", headers=headers, json=data, timeout=10)
    print(f"Text-bison Status: {response.status_code}")
    if response.status_code == 200:
        print("✅ Text generation works with older API!")
        print(f"Response: {response.text}")
    else:
        print(f"❌ Error: {response.text}")
        
except Exception as e:
    print(f"❌ Exception: {str(e)}")
