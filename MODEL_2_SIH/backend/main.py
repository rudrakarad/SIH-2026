import os
import sys
import pandas as pd
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

# Add current directory and parent directory to sys.path
sys.path.append(os.path.dirname(__file__))
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from weather import get_gfs_forecast
from risk_engine import calculate_risk
from decision_engine import generate_emergency_decision, generate_full_emergency_decision
from emergency_manager import create_emergency_plan
from location_advisory import generate_location_advisory
from early_warning import generate_early_warning, generate_forecast_warning
from smart_alerts import SmartAlertEngine, USER_DATABASE

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from dotenv import load_dotenv

# Load API keys from environment and SIH practice env paths
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))
load_dotenv(r"D:\SIH-2026 PRACTICE\.env")

app = FastAPI(
    title="SURAKSHAI - AI Disaster Management System",
    description="AI Emergency Decision Manager & Response System",
    version="2.0"
)

# Enable CORS for browser access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Smart Alert Engine
smart_alert_engine = SmartAlertEngine(USER_DATABASE)

# ==========================================
# ML MODEL INITIALIZATION (disaster_data.csv)
# ==========================================
ml_disaster_model = None
ml_urgency_model = None
disaster_vectorizer = None
urgency_vectorizer = None

ASSISTANCE_MAP = {
    "Flood": {
        "Low": "Municipal cleanup",
        "Medium": "Pumping equipment",
        "High": "Rescue team",
        "Critical": "Evacuation team"
    },
    "Fire": {
        "Low": "Fire safety inspection",
        "Medium": "Fire brigade",
        "High": "Fire suppression team",
        "Critical": "Emergency fire rescue"
    },
    "Earthquake": {
        "Low": "Safety inspection team",
        "Medium": "Building inspection team",
        "High": "Rescue team",
        "Critical": "Search and rescue team"
    },
    "Landslide": {
        "Low": "Geological monitoring",
        "Medium": "Road clearance team",
        "High": "Rescue team",
        "Critical": "Emergency rescue team"
    },
    "Cyclone": {
        "Low": "Weather monitoring",
        "Medium": "Emergency preparedness team",
        "High": "Evacuation team",
        "Critical": "Emergency rescue team"
    }
}

def train_ml_models():
    global ml_disaster_model, ml_urgency_model, disaster_vectorizer, urgency_vectorizer
    try:
        csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "disaster_data.csv")
        if not os.path.exists(csv_path):
            csv_path = "disaster_data.csv"
            
        df = pd.read_csv(csv_path)
        
        # Disaster classification model
        disaster_vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1, sublinear_tf=True)
        X_disaster = disaster_vectorizer.fit_transform(df["Message"])
        ml_disaster_model = LogisticRegression(max_iter=2000)
        ml_disaster_model.fit(X_disaster, df["Disaster"])
        
        # Urgency classification model
        urgency_vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1, sublinear_tf=True)
        X_urgency = urgency_vectorizer.fit_transform(df["Message"])
        ml_urgency_model = LogisticRegression(max_iter=2000, class_weight="balanced")
        ml_urgency_model.fit(X_urgency, df["Urgency"])
        
        print("ML Models trained successfully!")
    except Exception as e:
        print(f"Failed to train ML models: {e}")

# Train models on app startup
train_ml_models()

# ==========================================
# API ENDPOINTS
# ==========================================

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "system": "SURAKSHAI AI Disaster Management System",
        "ml_ready": ml_disaster_model is not None
    }

@app.get("/gfs")
def gfs_forecast():
    return get_gfs_forecast()

@app.get("/weather")
def weather(city: str = "Mumbai"):
    geo_url = "https://geocoding-api.open-meteo.com/v1/search"
    geo_response = requests.get(
        geo_url,
        params={"name": city, "count": 1, "language": "en", "format": "json"},
        timeout=10
    )
    geo_data = geo_response.json()

    if "results" not in geo_data or not geo_data["results"]:
        return {"error": f"City '{city}' not found"}

    location = geo_data["results"][0]
    lat = location["latitude"]
    lon = location["longitude"]
    city_name = location["name"]

    weather_url = "https://api.open-meteo.com/v1/forecast"
    weather_response = requests.get(
        weather_url,
        params={
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m,wind_gusts_10m,weather_code",
            "timezone": "Asia/Kolkata"
        },
        timeout=10
    )

    data = weather_response.json()
    current = data.get("current", {})

    return {
        "location": city_name,
        "latitude": lat,
        "longitude": lon,
        "time": current.get("time"),
        "temperature": current.get("temperature_2m", 0),
        "humidity": current.get("relative_humidity_2m", 0),
        "rain": current.get("rain", 0),
        "wind_speed": current.get("wind_speed_10m", 0),
        "wind_gust": current.get("wind_gusts_10m", 0),
        "weather_code": current.get("weather_code", 0)
    }

@app.get("/risk")
def risk_analysis(city: str = "Mumbai"):
    weather_data = weather(city)
    if "error" in weather_data:
        return weather_data

    risk = calculate_risk(weather_data)
    decision = generate_emergency_decision(weather_data, risk)

    return {
        "location": city,
        "weather": weather_data,
        "risk": risk,
        "decision": decision
    }

@app.get("/emergency-plan")
def emergency_plan(
    situation: str = "Flood reported",
    people_affected: int = 0,
    rescue_teams: int = 0,
    ambulances: int = 0,
    hospitals: int = 0,
    blocked_roads: int = 0
):
    return create_emergency_plan(
        situation,
        people_affected,
        rescue_teams,
        ambulances,
        hospitals,
        blocked_roads
    )

@app.get("/ai-emergency-decision")
def ai_emergency_decision(
    city: str = "Mumbai",
    situation: str = "Flood reported",
    people_affected: int = 500,
    rescue_teams: int = 3,
    ambulances: int = 5,
    hospitals: int = 4,
    blocked_roads: int = 2
):
    try:
        weather_data = weather(city)
        if "error" in weather_data:
            return weather_data

        risk = calculate_risk(weather_data)
        plan = create_emergency_plan(
            situation, people_affected, rescue_teams, ambulances, hospitals, blocked_roads
        )
        decision = generate_full_emergency_decision(weather_data, risk, plan)

        return {
            "location": city,
            "weather": weather_data,
            "risk": risk,
            "emergency_plan": plan,
            "ai_decision": decision
        }
    except Exception as error:
        return {
            "location": city,
            "status": "AI temporarily unavailable",
            "error": str(error),
            "emergency_plan": create_emergency_plan(
                situation, people_affected, rescue_teams, ambulances, hospitals, blocked_roads
            )
        }

@app.get("/location-advisory")
def location_advisory(city: str = "Mumbai", disaster_type: str = "general"):
    weather_data = weather(city)
    if "error" in weather_data:
        return weather_data

    risk = calculate_risk(weather_data)
    advisory = generate_location_advisory(city, weather_data, risk, disaster_type)

    return {
        "location": city,
        "weather": weather_data,
        "risk": risk,
        "advisory": advisory
    }

@app.get("/early-warning")
def early_warning(city: str = "Mumbai"):
    weather_data = weather(city)
    if "error" in weather_data:
        return weather_data

    risk = calculate_risk(weather_data)
    warning = generate_early_warning(weather_data, risk)

    return {
        "location": city,
        "weather": weather_data,
        "risk": risk,
        "early_warning": warning
    }

@app.get("/forecast-warning")
def forecast_warning(city: str = "Mumbai"):
    gfs_data = get_gfs_forecast()
    forecast_warning_data = generate_forecast_warning(gfs_data, city)

    return {
        "location": city,
        "forecast_warning": forecast_warning_data
    }

def generate_alert_message(category: str, severity: str):
    messages = {
        "flood": {
            "HIGH": "Heavy rainfall may cause flooding. Avoid low-lying areas and flooded roads.",
            "CRITICAL": "Critical flood risk detected. Move to a safer location and follow official instructions."
        },
        "cyclone": {
            "HIGH": "Strong winds are expected. Stay indoors and avoid unnecessary travel.",
            "CRITICAL": "Critical cyclone conditions detected. Stay indoors and follow official emergency instructions."
        },
        "heavy_rain": {
            "HIGH": "Heavy rainfall is expected. Avoid waterlogged roads and low-lying areas.",
            "CRITICAL": "Extreme rainfall detected. Prepare for possible flooding and follow official warnings."
        },
        "heatwave": {
            "HIGH": "High heat conditions detected. Stay hydrated and avoid unnecessary outdoor activity.",
            "CRITICAL": "Extreme heat detected. Stay indoors where possible and maintain hydration."
        },
        "landslide": {
            "HIGH": "Landslide risk detected. Avoid steep slopes and unstable areas.",
            "CRITICAL": "Critical landslide risk detected. Move away from unstable slopes and follow emergency instructions."
        }
    }
    return messages.get(category.lower(), {}).get(
        severity.upper(),
        "Disaster risk detected. Stay alert and follow official instructions."
    )

@app.get("/smart-alert")
def smart_alert(
    user_id: str = "user_101",
    category: str = "flood",
    severity: str = "HIGH"
):
    message = generate_alert_message(category, severity)
    result = smart_alert_engine.process_alert(user_id, category, message, severity)

    return {
        "feature": "Smart Personalized Alerts",
        "alert": result
    }

# ==========================================
# NEW ML PREDICTION API
# ==========================================
class MLPredictRequest(BaseModel):
    message: str

@app.post("/api/ml/predict")
def predict_disaster(req: MLPredictRequest):
    if ml_disaster_model is None or ml_urgency_model is None:
        raise HTTPException(status_code=500, detail="ML Models not initialized")

    user_msg = req.message.strip()
    if not user_msg:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Disaster Prediction
    msg_disaster_tfidf = disaster_vectorizer.transform([user_msg])
    disaster_pred = ml_disaster_model.predict(msg_disaster_tfidf)[0]
    disaster_probs = ml_disaster_model.predict_proba(msg_disaster_tfidf)[0]
    disaster_conf = float(max(disaster_probs) * 100)

    # Urgency Prediction
    msg_urgency_tfidf = urgency_vectorizer.transform([user_msg])
    urgency_pred = ml_urgency_model.predict(msg_urgency_tfidf)[0]
    urgency_probs = ml_urgency_model.predict_proba(msg_urgency_tfidf)[0]
    urgency_conf = float(max(urgency_probs) * 100)

    # Recommended Assistance
    disaster_cat = str(disaster_pred).capitalize()
    urgency_cat = str(urgency_pred).capitalize()
    
    recommended_assistance = ASSISTANCE_MAP.get(disaster_cat, {}).get(
        urgency_cat, "Emergency Response Team"
    )

    return {
        "message": user_msg,
        "predicted_disaster": disaster_cat,
        "disaster_confidence": round(disaster_conf, 2),
        "predicted_urgency": urgency_cat,
        "urgency_confidence": round(urgency_conf, 2),
        "recommended_assistance": recommended_assistance
    }

# ==========================================
# SURAKSHAI AI CHATBOT API
# ==========================================
class ChatbotRequest(BaseModel):
    message: str

SYSTEM_PROMPT = """You are SurakshAI, an AI disaster management assistant designed for people in India.
Provide clear, accurate, short, and practical guidance during emergencies and disasters such as earthquakes, floods, fires, cyclones, landslides, lightning, heatwaves, and other emergencies.

Rules:
1. Prioritize human safety above everything.
2. Give simple, actionable instructions in numbered steps or bullet points.
3. Keep emergency responses concise and easy to read.
4. Never suggest using matches/flames near gas leaks.
5. Provide India-appropriate emergency guidance (NDRF, local emergency lines 112 / 108 / 101).
6. If in immediate danger, tell them what to do right now first.
7. Stay calm, practical, and helpful."""

@app.post("/api/chatbot")
def chatbot_response(req: ChatbotRequest):
    user_msg = req.message.strip()
    if not user_msg:
        return {"response": "Please type or speak your query for SurakshAI."}

    groq_key = os.getenv("GROQ_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY")

    # 1. Try Groq (openai/gpt-oss-20b)
    if groq_key:
        try:
            from groq import Groq
            groq_client = Groq(api_key=groq_key)
            res = groq_client.chat.completions.create(
                model="openai/gpt-oss-20b",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_msg}
                ],
                max_tokens=500
            )
            return {"source": "Groq AI (SurakshAI)", "response": res.choices[0].message.content}
        except Exception as e:
            print("Groq error, trying Gemini:", e)

    # 2. Try Gemini (gemini-3.6-flash)
    if gemini_key:
        try:
            from google import genai
            gemini_client = genai.Client(api_key=gemini_key)
            res = gemini_client.models.generate_content(
                model="gemini-3.6-flash",
                contents=f"{SYSTEM_PROMPT}\n\nUser Question: {user_msg}"
            )
            return {"source": "Gemini AI (SurakshAI)", "response": res.text}
        except Exception as e:
            print("Gemini error, fallback to Rule Engine:", e)

    # 3. Dynamic Rule-based emergency fallback
    msg_lower = user_msg.lower()
    if any(w in msg_lower for w in ["earthquake", "quake", "tremor", "shaking"]):
        fallback = "🚨 **Earthquake Safety Protocol**:\n1. **Drop, Cover, and Hold On** under a sturdy desk or table.\n2. Stay away from glass windows, heavy mirrors, and outer walls.\n3. If outdoors, move to an open field clear of buildings, utility poles, and streetlights.\n4. If driving, pull over safely in an open space and stay inside the vehicle.\n5. Call National Emergency Helpline **112** if trapped or injured."
    elif any(w in msg_lower for w in ["flood", "water", "drown", "overflow", "submerged"]):
        fallback = "🌊 **Flood Safety Protocol**:\n1. Move immediately to higher ground or upper floors of a safe building.\n2. Do NOT walk or drive through moving floodwaters (15 cm can sweep you away).\n3. Turn off the main electrical breaker box and gas valve.\n4. Keep an emergency survival kit with clean drinking water and charged phone.\n5. Call NDRF / SDRF Helpline **112** or **1078** for boat rescue."
    elif any(w in msg_lower for w in ["fire", "flame", "smoke", "burn", "explosion"]):
        fallback = "🔥 **Fire Emergency Protocol**:\n1. Evacuate immediately using fire stairs — **NEVER use elevators**.\n2. Stay low to the floor to crawl under poisonous smoke.\n3. Check doors with the back of your hand before opening; if hot, keep it closed.\n4. If clothing catches fire: **Stop, Drop, and Roll**.\n5. Call Fire Services **101** or Emergency **112** immediately."
    elif any(w in msg_lower for w in ["gas", "leak", "lpg", "cylinder", "smell"]):
        fallback = "☣️ **Gas / LPG Leak Protocol**:\n1. Open all windows and exterior doors immediately to ventilate.\n2. **DO NOT switch on/off any electrical appliances or light switches**.\n3. Never use matches, lighters, or open flames.\n4. Turn off the cylinder regulator valve if safe to reach.\n5. Evacuate outdoors and call LPG Emergency Helpline **1906** or **112**."
    elif any(w in msg_lower for w in ["cyclone", "storm", "wind", "gale", "thunder"]):
        fallback = "🌪️ **Cyclone & Storm Protocol**:\n1. Stay indoors away from windows, glass panes, and weak roofing.\n2. Unplug electrical appliances to prevent damage from power surges.\n3. Keep emergency flashlights, battery-powered radios, and extra batteries ready.\n4. If instructed to evacuate by local disaster authorities, move to designated shelters immediately."
    elif any(w in msg_lower for w in ["landslide", "mudslide", "ghat", "slope"]):
        fallback = "⛰️ **Landslide Safety Protocol**:\n1. Evacuate areas near steep slopes, cliffs, or river valleys immediately.\n2. Listen for unusual sounds like trees cracking or boulders knocking together.\n3. Stay alert while driving along mountain highways/ghats.\n4. Contact State Disaster Management Authority (SDMA) at **1070**."
    elif any(w in msg_lower for w in ["number", "helpline", "call", "contact", "phone"]):
        fallback = "📞 **Important Emergency Helpline Numbers (India)**:\n- **National Emergency Helpline**: 112\n- **Fire Department**: 101\n- **Ambulance Service**: 108 / 102\n- **Police**: 100\n- **NDRF Disaster Management**: 1078 / 011-24363260\n- **LPG Gas Leak Helpline**: 1906"
    else:
        fallback = f"🚨 **SurakshAI Safety Advice for '{user_msg}'**:\n1. Stay calm and assess your immediate surroundings for hazards.\n2. Move to a safe location away from collapsing structures or hazardous zones.\n3. Contact India National Emergency Line **112** or Disaster Control **1078**.\n4. Follow instructions issued by local emergency response authorities."

    return {"source": "SurakshAI Rule Engine", "response": fallback}

# Static file serving for Frontend (Mounted at root '/')
frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")