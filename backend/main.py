from fastapi import FastAPI
from weather import get_gfs_forecast
from risk_engine import calculate_risk
from decision_engine import generate_emergency_decision, generate_full_emergency_decision
from emergency_manager import create_emergency_plan
from location_advisory import generate_location_advisory
from early_warning import generate_early_warning, generate_forecast_warning
from smart_alerts import SmartAlertEngine, USER_DATABASE
smart_alert_engine = SmartAlertEngine(USER_DATABASE)  # Initialize with user database

app = FastAPI(
    title="Disaster Management AI",
    description="AI Emergency Decision Manager",
    version="1.0"
)


@app.get("/")
def home():
    return {
        "status": "online",
        "message": "AI Emergency Decision Manager is running"

    }


@app.get("/gfs")
def gfs_forecast():
    return get_gfs_forecast()


@app.get("/weather")
def weather(city: str = "Mumbai"):

    import requests

    # Convert city name to coordinates
    geo_url = "https://geocoding-api.open-meteo.com/v1/search"

    geo_response = requests.get(
        geo_url,
        params={
            "name": city,
            "count": 1,
            "language": "en",
            "format": "json"
        }
    )

    geo_data = geo_response.json()

    if "results" not in geo_data:
        return {"error": "City not found"}

    location = geo_data["results"][0]

    lat = location["latitude"]
    lon = location["longitude"]
    city_name = location["name"]

    # Get real weather
    weather_url = "https://api.open-meteo.com/v1/forecast"

    weather_response = requests.get(
        weather_url,
        params={
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m,wind_gusts_10m,weather_code",
            "timezone": "Asia/Kolkata"
        }
    )

    data = weather_response.json()
    current = data["current"]

    return {
        "location": city_name,
        "latitude": lat,
        "longitude": lon,
        "time": current["time"],
        "temperature": current["temperature_2m"],
        "humidity": current["relative_humidity_2m"],
        "rain": current["rain"],
        "wind_speed": current["wind_speed_10m"],
        "wind_gust": current["wind_gusts_10m"],
        "weather_code": current["weather_code"]
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
    situation: str,
    people_affected: int = 0,
    rescue_teams: int = 0,
    ambulances: int = 0,
    hospitals: int = 0,
    blocked_roads: int = 0
):

    plan = create_emergency_plan(
        situation,
        people_affected,
        rescue_teams,
        ambulances,
        hospitals,
        blocked_roads
    )

    return plan

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

        emergency_plan = create_emergency_plan(
            situation,
            people_affected,
            rescue_teams,
            ambulances,
            hospitals,
            blocked_roads
        )

        decision = generate_full_emergency_decision(
            weather_data,
            risk,
            emergency_plan
        )

        return {
            "location": city,
            "weather": weather_data,
            "risk": risk,
            "emergency_plan": emergency_plan,
            "ai_decision": decision
        }

    except Exception as error:
        return {
            "location": city,
            "status": "AI temporarily unavailable",
            "error": str(error),
            "emergency_plan": create_emergency_plan(
                situation,
                people_affected,
                rescue_teams,
                ambulances,
                hospitals,
                blocked_roads
            )
        }

@app.get("/location-advisory")
def location_advisory(
    city: str = "Mumbai",
    disaster_type: str = "general"
):

    weather_data = weather(city)

    if "error" in weather_data:
        return weather_data

    risk = calculate_risk(weather_data)

    advisory = generate_location_advisory(
        city,
        weather_data,
        risk,
        disaster_type
    )

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

    warning = generate_early_warning(
        weather_data,
        risk
    )

    return {
        "location": city,
        "weather": weather_data,
        "risk": risk,
        "early_warning": warning
    }

@app.get("/forecast-warning")
def forecast_warning(city: str = "Mumbai"):

    gfs_data = get_gfs_forecast()

    forecast_warning_data = generate_forecast_warning(
        gfs_data,
        city
    )

    return {
        "location": city,
        "forecast_warning": forecast_warning_data
    }
@app.get("/smart-alert")
def generate_alert_message(category, severity):

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

    return messages.get(category, {}).get(
        severity,
        "Disaster risk detected. Stay alert and follow official instructions."
    )


@app.get("/smart-alert")
def smart_alert(
    user_id: str = "user_101",
    category: str = "flood",
    severity: str = "HIGH"
):

    message = generate_alert_message(category, severity)

    result = smart_alert_engine.process_alert(
        user_id,
        category,
        message,
        severity
    )

    return {
        "feature": "Smart Personalized Alerts",
        "alert": result
    }