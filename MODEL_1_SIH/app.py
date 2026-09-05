import os
import sys
import pandas as pd
from flask import Flask, request, jsonify, send_from_directory
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from backend.emergency_manager import create_emergency_plan
from backend.early_warning import generate_early_warning
from backend.location_advisory import generate_location_advisory
from backend.risk_engine import calculate_risk
from backend.decision_engine import generate_full_emergency_decision, generate_emergency_decision

def get_bot_response(question):
    if not question or not question.strip():
        return ""
    q = question.lower()
    if "earthquake" in q or "shaking" in q or "tremor" in q:
        return "🏚️ **Earthquake Safety Protocol:**\n1. DROP, COVER, and HOLD ON under a heavy desk or table.\n2. Stay away from glass windows and tall furniture.\n3. Do NOT use elevators.\n4. If outdoors, move to an open area away from power lines and tall structures."
    elif "flood" in q or "water" in q or "rain" in q:
        return "🌊 **Flood Emergency Precautions:**\n1. Move immediately to higher ground or upper building floors.\n2. Do NOT walk or drive through moving water.\n3. Turn off main electrical circuit breakers.\n4. Boil drinking water or use purification tablets."
    elif "fire" in q or "smoke" in q or "burn" in q:
        return "🚒 **Fire Evacuation Protocol:**\n1. Call Fire Brigade (101) immediately.\n2. Crawl low beneath smoke to maintain clean air.\n3. Feel door handles before opening.\n4. Use emergency stairwells only—never elevators."
    elif "gas" in q or "leak" in q:
        return "☣️ **Gas Leak Warning:**\n1. Do NOT operate electrical switches or light matches.\n2. Open all doors and windows for ventilation.\n3. Close the cylinder regulator valve immediately.\n4. Evacuate and call Emergency Services (112 / 101)."
    else:
        return "🤖 **AapdaSahayak Assistant:**\nStay calm during emergencies and follow local safety advisories. Helpline numbers in India: Police **112**, Ambulance **108**, Fire **101**, NDRF **1078**."


# Fix Windows console UTF-8 encoding
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

app = Flask(__name__, static_folder='.', static_url_path='')
app.config['JSON_AS_ASCII'] = False

# Enable CORS for cross-origin and file:// access
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
    return response

# -------------------------------------------------------------
# 1. TRAIN ML MODEL ON STARTUP (Same logic as ml_model.py)
# -------------------------------------------------------------
print("[INFO] Training Disaster Classification ML Model...")
data_path = os.path.join(os.path.dirname(__file__), "disaster_data.csv")
df = pd.read_csv(data_path)

x = df["Message"]
y = df["Disaster"]

vectorizer = TfidfVectorizer()
x_tfidf = vectorizer.fit_transform(x)

model = LogisticRegression(max_iter=1000)
model.fit(x_tfidf, y)
print("[OK] ML Model trained successfully on dataset!")

response_map = {
    "Flood": "Send rescue team and provide evacuation and shelter information.",
    "Fire": "Alert fire brigade and initiate evacuation.",
    "Earthquake": "Send rescue team and conduct building safety inspection.",
    "Medical Emergency": "Contact ambulance and provide emergency medical assistance.",
    "Other": "Forward the request to the appropriate disaster-management authority."
}

# -------------------------------------------------------------
# 2. FLASK ROUTES
# -------------------------------------------------------------
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    data = request.get_json() or {}
    user_message = data.get('message', '')
    
    if not user_message:
        return jsonify({'error': 'Empty message'}), 400

    message_tfidf = vectorizer.transform([user_message])
    prediction = model.predict(message_tfidf)[0]
    probabilities = model.predict_proba(message_tfidf)
    confidence = float(max(probabilities[0]) * 100)

    # Infer urgency from text
    lower = user_message.lower()
    if any(k in lower for k in ['critical', 'trapped', 'submerged', 'unconscious', 'chest pain', 'collapse', 'urgent', 'drown']):
        urgency = "Critical"
    elif any(k in lower for k in ['high', 'rising', 'spill', 'severe', 'cut off']):
        urgency = "High"
    elif any(k in lower for k in ['low', 'gutter', 'mild', 'clean']):
        urgency = "Low"
    else:
        urgency = "Medium"

    assistance_dict = {
        "Flood": "evacuation, rescue boat & pumps",
        "Fire": "fire brigade & hazmat team",
        "Earthquake": "search and rescue, structural inspection",
        "Medical Emergency": "ambulance, medical team",
        "Other": "municipal & disaster authority"
    }

    return jsonify({
        'disaster': prediction,
        'confidence': round(confidence, 1),
        'urgency': urgency,
        'assistance': assistance_dict.get(prediction, 'emergency response team'),
        'response': response_map.get(prediction, 'Forward to emergency authorities.')
    })

@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    data = request.get_json() or {}
    question = data.get('message', '')

    if not question:
        return jsonify({'error': 'Empty message'}), 400

    answer = get_bot_response(question)
    return jsonify({'reply': answer})

@app.route('/api/emergency-plan', methods=['POST', 'OPTIONS'])
def api_emergency_plan():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    data = request.get_json() or {}
    situation = data.get('situation', 'Emergency reported')
    people_affected = int(data.get('people_affected', 0))
    rescue_teams = int(data.get('rescue_teams', 0))
    ambulances = int(data.get('ambulances', 0))
    hospitals = int(data.get('hospitals', 0))
    blocked_roads = int(data.get('blocked_roads', 0))

    plan = create_emergency_plan(
        situation,
        people_affected,
        rescue_teams,
        ambulances,
        hospitals,
        blocked_roads
    )

    return jsonify(plan)

@app.route('/ai-emergency-decision', methods=['GET', 'POST', 'OPTIONS'])
@app.route('/api/ai-emergency-decision', methods=['GET', 'POST', 'OPTIONS'])
def api_ai_emergency_decision():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    if request.method == 'POST':
        data = request.get_json() or {}
    else:
        data = request.args.to_dict()

    city = data.get('city', 'Mumbai')
    situation = data.get('situation', 'Emergency reported')
    people_affected = int(data.get('people_affected', 500))
    rescue_teams = int(data.get('rescue_teams', 3))
    ambulances = int(data.get('ambulances', 5))
    hospitals = int(data.get('hospitals', 4))
    blocked_roads = int(data.get('blocked_roads', 2))

    weather_data = {"location": city, "temperature": 30.0, "humidity": 85, "rain": 35.0, "wind_speed": 40.0, "wind_gust": 55.0}
    risk = calculate_risk(weather_data)

    emergency_plan = create_emergency_plan(
        situation,
        people_affected,
        rescue_teams,
        ambulances,
        hospitals,
        blocked_roads
    )

    decision_res = generate_full_emergency_decision(
        weather_data,
        risk,
        emergency_plan
    )

    return jsonify({
        "location": city,
        "weather": weather_data,
        "risk": risk,
        "emergency_plan": emergency_plan,
        "ai_decision": decision_res
    })

@app.route('/api/early-warning', methods=['GET', 'POST'])
def api_early_warning():
    rain = float(request.args.get('rain', 35))
    wind = float(request.args.get('wind', 45))
    gust = float(request.args.get('gust', 55))
    humidity = float(request.args.get('humidity', 85))
    temperature = float(request.args.get('temp', 32))

    weather_data = {"rain": rain, "wind_speed": wind, "wind_gust": gust, "humidity": humidity, "temperature": temperature}
    risk_data = calculate_risk(weather_data)
    result = generate_early_warning(weather_data, risk_data)
    return jsonify(result)

@app.route('/api/location-advisory', methods=['GET', 'POST'])
def api_location_advisory():
    city = request.args.get('city', 'Mumbai')
    disaster_type = request.args.get('disaster_type', 'general')

    weather_data = {"rain": 25, "wind_speed": 35, "wind_gust": 45, "humidity": 80, "temperature": 30}
    risk_data = calculate_risk(weather_data)
    result = generate_location_advisory(city, weather_data, risk_data, disaster_type)
    return jsonify(result)

@app.route('/api/files', methods=['GET'])
def list_files():
    base_dir = os.path.dirname(__file__)
    files_list = []
    
    for root, dirs, files in os.walk(base_dir):
        if '.git' in root or '__pycache__' in root:
            continue
        for f in files:
            rel_path = os.path.relpath(os.path.join(root, f), base_dir).replace('\\', '/')
            files_list.append(rel_path)
            
    return jsonify({'files': files_list})

@app.route('/api/file-content', methods=['GET'])
def file_content():
    filename = request.args.get('file', '')
    if not filename:
        return jsonify({'error': 'No file specified'}), 400

    base_dir = os.path.dirname(__file__)
    target_path = os.path.abspath(os.path.join(base_dir, filename))

    if not target_path.startswith(os.path.abspath(base_dir)):
        return jsonify({'error': 'Access denied'}), 403

    if not os.path.exists(target_path):
        return jsonify({'error': 'File not found'}), 404

    try:
        with open(target_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        return content, 200, {'Content-Type': 'text/plain; charset=utf-8'}
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("[SERVER] Starting AapdaSahayak & RescuAI Web Server on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
