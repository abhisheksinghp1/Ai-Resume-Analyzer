import requests
import json

# Test the backend response
try:
    # Create a simple test file
    test_content = b"John Doe\n\nSkills: Python, JavaScript, React\n\nEducation: BS Computer Science - University - 2020\n\nExperience: Software Engineer - Tech Corp - 2020-2023"
    
    files = {'file': ('test.txt', test_content, 'text/plain')}
    
    response = requests.post('http://localhost:8000/upload-resume', files=files)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Content: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\nParsed JSON:")
        print(json.dumps(data, indent=2))
        
        if 'data' in data:
            print(f"\nResume Data Structure:")
            resume_data = data['data']
            print(f"Name: {resume_data.get('name', 'NOT FOUND')}")
            print(f"Skills: {resume_data.get('technical_skills', 'NOT FOUND')}")
            print(f"Education: {resume_data.get('education', 'NOT FOUND')}")
            print(f"Experience: {resume_data.get('experience', 'NOT FOUND')}")
            print(f"Other: {resume_data.get('other_sections', 'NOT FOUND')}")
    
except Exception as e:
    print(f"Error: {str(e)}")
