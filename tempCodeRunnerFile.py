import os
import tensorflow as tf
import numpy as np
import json
import traceback
import re
import time
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.models import load_model
from flask import Flask, request, render_template, jsonify, redirect
from werkzeug.utils import secure_filename
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the new model (ensure the file name matches your trained model)
model = load_model('leaf_disease_model.h5')
print('Model loaded. Check http://127.0.0.1:5000/')

# Labels dictionary remains the same
labels = {
    0: 'Healthy',
    1: 'Powdery',
    2: 'Rust',
}

# Response templates based on the diagnosis
responses = {
    'Healthy': "Your leaf is healthy! The plant shows no signs of disease or stress. Continue regular watering and ensure it receives adequate sunlight. Maintain good air circulation around plants to prevent future issues.",
    
    'Powdery': "Your leaf has powdery mildew, a fungal disease that appears as white powdery spots on leaves. It thrives in humid conditions with poor air circulation. Remove affected leaves, improve air flow, and apply a fungicide or neem oil spray. Water at the base of plants rather than on foliage.",
    
    'Rust': "Your leaf has rust disease, characterized by orange-brown pustules on the undersides of leaves. This fungal infection spreads in wet conditions and weakens plants. Remove and dispose of infected leaves, avoid overhead watering, and apply a suitable fungicide. Ensure proper spacing between plants for good air circulation."
}

# Fallback responses for when the API is unavailable
FALLBACK_RESPONSES = {
    "powdery mildew": """
DESCRIPTION: Powdery mildew is a fungal disease that appears as white powdery spots on leaves and stems.

CAUSE: It thrives in humid environments with poor air circulation and moderate temperatures.

SOLUTION:
• Remove and dispose of infected leaves
• Improve air circulation around plants
• Apply fungicides like neem oil or potassium bicarbonate
""",
    "leaf spot": """
DESCRIPTION: Leaf spot diseases are fungal or bacterial infections that cause spots on leaves.

CAUSE: Caused by various pathogens that spread in wet conditions, especially with overhead watering.

SOLUTION:
• Remove infected leaves
• Avoid wetting leaves when watering
• Apply appropriate fungicide or bactericide
""",
    "rust": """
DESCRIPTION: Rust is a fungal disease that forms orange-brown pustules on leaf undersides.

CAUSE: Caused by fungal pathogens that thrive in moist environments and moderate temperatures.

SOLUTION:
• Remove and destroy infected plant parts
• Improve air circulation
• Apply fungicides with sulfur or copper compounds
""",
    "aphids": """
DESCRIPTION: Aphids are small sap-sucking insects that cluster on new growth and leaf undersides.

CAUSE: Rapid reproduction in favorable conditions, attracted to new growth and stressed plants.

SOLUTION:
• Spray plants with strong water jet to dislodge aphids
• Introduce beneficial insects like ladybugs
• Apply insecticidal soap or neem oil
""",
    "general": """
DESCRIPTION: Plant diseases are typically caused by fungi, bacteria, viruses or pests.

CAUSE: Most plant problems arise from environmental stress, poor growing conditions, or pathogens.

SOLUTION:
• Ensure proper watering, lighting, and soil conditions
• Remove infected plant material promptly
• Use appropriate treatments based on specific diagnosis
"""
}

# Google Gemini API configuration
GEMINI_API_KEY = "AIzaSyBS72b6l44jv8STNMwjPMrbEBKrDxwf640"
GEMINI_MODEL = "gemini-2.0-flash"
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"

# Expanded keywords for plant-related queries - very inclusive
PLANT_RELATED_KEYWORDS = [
    'plant', 'garden', 'tree', 'flower', 'grass', 'bush', 'shrub', 'herb', 'vegetable', 'fruit', 
    'leaf', 'leaves', 'stem', 'root', 'seed', 'soil', 'branch', 'bark', 'twig', 'photosynthesis',
    'bloom', 'blossom', 'petal', 'sprout', 'grow', 'cultivation', 'agriculture', 'farming', 'crop',
    'fertilizer', 'water', 'watering', 'sunlight', 'shade', 'humid', 'temperature', 'climate',
    'pest', 'disease', 'insect', 'fungi', 'fungus', 'bacteria', 'virus', 'mildew', 'blight',
    'rot', 'weed', 'pruning', 'cutting', 'propagation', 'pollinate', 'harvest', 'botanical',
    'botany', 'horticulture', 'landscaping', 'nursery', 'greenhouse', 'terrace', 'balcony',
    'indoor plant', 'outdoor plant', 'houseplant', 'succulent', 'cactus', 'orchid', 'fern',
    'ivy', 'vine', 'moss', 'composting', 'mulch', 'organic', 'pesticide', 'herbicide',
    'fungicide', 'insecticide', 'lawn', 'meadow', 'forest', 'woodland', 'gardening',
    'ph level', 'nitrogen', 'phosphorus', 'potassium', 'npk', 'micronutrient', 'mineral',
    'mulching', 'humus', 'peat', 'transplant', 'repot', 'foliage', 'cultivar', 'species',
    'genus', 'family', 'chlorophyll', 'oxygen', 'carbon dioxide', 'vegetative', 'bulb',
    'tuber', 'rhizome', 'stolon', 'germinate', 'seedling', 'sapling', 'hybrid', 'graft',
    'nature', 'ecosystem', 'biodiversity', 'environment', 'ecology', 'green', 'sustainability'
]

def is_plant_related(query):
    """
    Check if the query is related to plants in any way
    Very inclusive to catch all plant-related queries
    """
    query = query.lower()
    
    # Check for any of the plant-related keywords
    for keyword in PLANT_RELATED_KEYWORDS:
        if re.search(r'\b' + keyword + r'\b', query):
            return True
    
    # If no keywords found, it's not plant-related
    return False

def get_fallback_response(query):
    """
    Get a fallback response based on keywords in the query
    """
    query = query.lower()
    
    if 'powdery' in query or 'mildew' in query:
        return FALLBACK_RESPONSES["powdery mildew"]
    elif 'spot' in query:
        return FALLBACK_RESPONSES["leaf spot"]
    elif 'rust' in query:
        return FALLBACK_RESPONSES["rust"]
    elif 'aphid' in query or 'bug' in query or 'insect' in query or 'pest' in query:
        return FALLBACK_RESPONSES["aphids"]
    else:
        return FALLBACK_RESPONSES["general"]

def getResult(image_path):
    # Updated target size to (224,224) to match EfficientNetB0's expected input size
    img = load_img(image_path, target_size=(224,224))
    x = img_to_array(img)
    x = x.astype('float32') / 255.
    x = np.expand_dims(x, axis=0)
    predictions = model.predict(x)[0]
    return predictions

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/predict', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        f = request.files['file']
        basepath = os.path.dirname(__file__)
        file_path = os.path.join(basepath, 'uploads', secure_filename(f.filename))
        f.save(file_path)
        predictions = getResult(file_path)
        predicted_label = labels[np.argmax(predictions)]
        
        # Return the appropriate response based on the prediction
        return responses[predicted_label]
    return "Upload a leaf image to check its health."

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    conversation_history = data.get('history', [])
    
    # Check if the query is related to plants
    if not is_plant_related(user_message):
        return jsonify({"response": "Sorry, I can't help you with that."})
    
    # Broader system prompt to allow more plant-related discussions
    system_prompt = "You are a knowledgeable AI assistant with expertise in everything related to plants, including gardening, botany, agriculture, plant diseases, ecology, and horticulture. Follow these guidelines:\n"
    system_prompt += "• Answer ANY question related to plants, nature, gardening, ecology, botany, or agriculture.\n"
    system_prompt += "• Use simple, friendly language and a conversational tone.\n"
    system_prompt += "• Provide clear, actionable advice when applicable.\n"
    system_prompt += "• When discussing specific plant diseases or problems, structure your response with:\n"
    system_prompt += "  1. DESCRIPTION: A brief description of the issue.\n"
    system_prompt += "  2. CAUSE: What causes the problem.\n"
    system_prompt += "  3. SOLUTION: How to address it.\n"
    system_prompt += "• For general plant care questions, provide helpful tips and comprehensive advice.\n"
    system_prompt += "• You can discuss any topic that's even tangentially related to plants, including:\n"
    system_prompt += "  - Plant identification, classification, and biology\n"
    system_prompt += "  - Growing techniques, propagation, and cultivation\n"
    system_prompt += "  - Environmental factors, climate, and ecology\n"
    system_prompt += "  - Garden design, landscaping, and aesthetics\n"
    system_prompt += "  - Tools, equipment, and supplies for plant care\n"
    system_prompt += "  - Sustainable practices and environmental conservation\n"
    system_prompt += "• Be informative and thorough in your responses.\n"
    
    # Format the message with context if there is conversation history
    if len(conversation_history) > 2:
        formatted_message = f"{system_prompt}\n\nPrevious conversation:\n"
        
        # Skip the system message at index 0
        for i in range(1, len(conversation_history)):
            msg = conversation_history[i]
            if msg["role"] == "user":
                formatted_message += f"User: {msg['content']}\n"
            elif msg["role"] == "assistant":
                formatted_message += f"Assistant: {msg['content']}\n"
        
        # Add the current message
        formatted_message += f"\nUser: {user_message}"
    else:
        # For the first message or short conversations
        formatted_message = f"{system_prompt}\n\nPlease provide a comprehensive response to this plant-related question: {user_message}"
    
    # Use the exact same payload format that worked in our test script
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": formatted_message}
                ]
            }
        ]
    }
    
    # Call the Gemini API
    headers = {
        'Content-Type': 'application/json'
    }
    
    # Add retry mechanism for API calls
    max_retries = 2
    retry_delay = 1  # seconds
    
    for attempt in range(max_retries + 1):
        try:
            print(f"Attempt {attempt+1}/{max_retries+1}: Sending request to Gemini API")
            
            # Make the API call with a timeout
            response = requests.post(GEMINI_API_URL, headers=headers, json=payload, timeout=10)
            
            # Print status code and response
            print(f"Response status code: {response.status_code}")
            
            # Check for HTTP errors
            response.raise_for_status()
            
            # Parse response as JSON
            response_data = response.json()
            
            # Extract the response text from Gemini
            if 'candidates' in response_data and len(response_data['candidates']) > 0:
                ai_message = response_data['candidates'][0]['content']['parts'][0]['text']
                return jsonify({"response": ai_message})
            else:
                print("No candidates found in response data")
                # Use fallback response with a friendly message
                return jsonify({"response": "I couldn't generate a complete answer for you right now. Here's some helpful information about your question:\n\n" + get_fallback_response(user_message)})
        
        except (requests.exceptions.RequestException, requests.exceptions.HTTPError, 
                requests.exceptions.ConnectionError, requests.exceptions.Timeout) as e:
            error_msg = f"Connection Error: {str(e)}"
            print(error_msg)
            
            # If we've tried the maximum number of times, use fallback response
            if attempt == max_retries:
                print("Using fallback response due to connection issues.")
                # Return a more user-friendly connection error message
                return jsonify({"response": "Sorry, I'm having trouble connecting to my knowledge base right now. Here's some general advice based on your query:\n\n" + get_fallback_response(user_message)})
            
            # Otherwise wait and retry
            time.sleep(retry_delay)
            retry_delay *= 2  # Exponential backoff
        
        except json.JSONDecodeError as e:
            error_msg = f"JSON Decode Error: {str(e)}"
            print(error_msg)
            # Use fallback response with user-friendly message
            return jsonify({"response": "I'm having trouble processing your request. Here's some helpful information:\n\n" + get_fallback_response(user_message)})
        
        except Exception as e:
            error_msg = f"Unexpected Error: {str(e)}"
            print(error_msg)
            print(traceback.format_exc())
            # Use fallback response with user-friendly message
            return jsonify({"response": "I encountered an unexpected issue. Here's some information that might help:\n\n" + get_fallback_response(user_message)})

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # In a real application, you would validate credentials here
        email = request.form.get('email')
        password = request.form.get('password')
        
        # For demo purposes, just log the login attempt
        print(f"Login attempt from: {email}")
        
        # Redirect to the home page after login
        return redirect('/')
    
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        # In a real application, you would create a new user here
        full_name = request.form.get('fullName')
        email = request.form.get('email')
        password = request.form.get('password')
        role = request.form.get('role')
        
        # For demo purposes, just log the registration attempt
        print(f"Registration attempt for: {full_name} ({email}), role: {role}")
        
        # Redirect to the login page after signup
        return redirect('/login')
    
    return render_template('signup.html')

if __name__ == '__main__':
    app.run(debug=True)