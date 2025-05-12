import requests
import json

# Google Gemini API configuration
GEMINI_API_KEY = "AIzaSyBS72b6l44jv8STNMwjPMrbEBKrDxwf640"
GEMINI_MODEL = "gemini-2.0-flash"
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"

# Test with the simplest possible payload
payload = {
    "contents": [
        {
            "parts": [
                {"text": "Hello, how can you help with plant diseases?"}
            ]
        }
    ]
}

headers = {
    'Content-Type': 'application/json'
}

print("Sending test request to Gemini API...")
print(f"URL: {GEMINI_API_URL}")
print(f"Payload: {json.dumps(payload, indent=2)}")

try:
    response = requests.post(GEMINI_API_URL, headers=headers, json=payload)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response headers: {response.headers}")
    
    response_text = response.text
    print(f"Response body: {response_text}")
    
    if response.status_code == 200:
        response_data = response.json()
        if 'candidates' in response_data and len(response_data['candidates']) > 0:
            message = response_data['candidates'][0]['content']['parts'][0]['text']
            print("\nSuccess! Received response from Gemini:")
            print(message)
        else:
            print("\nAPI returned 200 but no candidates were found in the response.")
    else:
        print(f"\nAPI returned error status code: {response.status_code}")
        
except Exception as e:
    print(f"Error testing Gemini API: {str(e)}") 