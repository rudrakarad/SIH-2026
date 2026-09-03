
import os
import time

from dotenv import load_dotenv
from google import genai

# Load API key from .env
load_dotenv()

# Create Gemini client
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


# --------------------------------------------------
# FALLBACK EMERGENCY DECISION
# --------------------------------------------------

def fallback_decision(weather, risk):

    risk_level = risk.get("risk_level", "LOW")
    score = risk.get("risk_score", 0)
    factors = risk.get("risk_factors", [])

    if risk_level == "CRITICAL":

        priority = "IMMEDIATE"

        actions = [
            "Activate emergency response procedures",
            "Issue public warning",
            "Monitor vulnerable areas continuously",
            "Prepare emergency resources and evacuation support"
        ]

    elif risk_level == "HIGH":

        priority = "HIGH"

        actions = [
            "Increase emergency monitoring",
            "Alert local authorities",
            "Prepare emergency resources",
            "Issue precautionary public advisory"
        ]

    elif risk_level == "MEDIUM":

        priority = "MODERATE"

        actions = [
            "Continue weather monitoring",
            "Keep emergency teams on standby",
            "Issue precautionary advisory if conditions worsen"
        ]

    else:

        priority = "NORMAL"

        actions = [
            "Continue routine monitoring",
            "No immediate emergency deployment required"
        ]

    return {
        "source": "Emergency Rule Engine",
        "situation": f"Current disaster risk level is {risk_level}.",
        "risk_assessment": f"Risk score: {score}. Factors: {factors}",
        "priority": priority,
        "recommended_actions": actions,
        "resources_required": "Based on current risk level",
        "public_advisory": "Continue monitoring official weather and emergency alerts."
    }


# --------------------------------------------------
# AI EMERGENCY DECISION MANAGER
# --------------------------------------------------

def generate_emergency_decision(weather, risk):

    prompt = f"""
You are an AI Emergency Decision Manager for a disaster management system.

Analyze the following real-time weather and risk information.

WEATHER:
{weather}

RISK:
{risk}

Return a practical emergency management decision using this structure:

Situation:
Risk Assessment:
Priority:
Recommended Actions:
Resources Required:
Public Advisory:

Keep the response concise and suitable for a disaster management control room.

Do not invent weather values.
Only use information provided in the weather and risk data.
"""

    # Try Gemini up to 3 times
    for attempt in range(3):

        try:

            response = client.models.generate_content(
                model="gemini-3.7-flash",
                contents=prompt
            )

            return {
                "source": "Gemini AI",
                "decision": response.text
            }

        except Exception as error:

            print(f"Gemini attempt {attempt + 1} failed.")

            if attempt < 2:
                time.sleep(3)

            else:
                print("Gemini temporarily unavailable:", error)

    # If Gemini fails, use the emergency rule engine
    return fallback_decision(weather, risk)

def generate_full_emergency_decision(
    weather,
    risk,
    emergency_plan
):

    prompt = f"""
You are an AI Emergency Decision Manager for a disaster management system.

Analyze ALL the following information.

WEATHER:
{weather}

RISK ASSESSMENT:
{risk}

EMERGENCY SITUATION AND RESOURCES:
{emergency_plan}

Return exactly these sections:

Situation:
Risk Assessment:
Resource Situation:
Priority:
Recommended Actions:
Resources Required:
Public Advisory:

Consider:
- Weather conditions
- Disaster risk level
- Number of people affected
- Available rescue teams
- Available ambulances
- Available hospitals
- Blocked roads
- Resource shortages

Do not invent weather or resource values.
Use only the information provided.
Keep the response concise and suitable for a disaster management control room.
"""

    for attempt in range(3):

        try:

            response = client.models.generate_content(
                model="gemini-3.6-flash",
                contents=prompt
            )

            return {
                "source": "Gemini AI",
                "decision": response.text
            }

        except Exception as error:

            print(f"Gemini emergency decision attempt {attempt + 1} failed: {error}")

            if attempt < 2:
                time.sleep(3)

    return {
        "source": "Emergency Rule Engine",
        "decision": {
            "message": "Gemini AI temporarily unavailable.",
            "emergency_plan": emergency_plan
        }
    }