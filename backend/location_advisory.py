
def generate_location_advisory(city, weather, risk, disaster_type="general"):

    risk_level = risk.get("risk_level", "LOW")
    risk_score = risk.get("risk_score", 0)
    factors = risk.get("risk_factors", [])

    disaster_type = disaster_type.lower()

    actions = []
    avoid = []

    if disaster_type == "flood":
        actions = [
            "Move to safer or elevated areas if flooding increases",
            "Monitor official flood warnings",
            "Keep emergency supplies and important documents ready",
            "Use alternate routes if roads are waterlogged"
        ]
        avoid = [
            "Do not enter flooded roads",
            "Avoid walking or driving through moving water"
        ]

    elif disaster_type == "cyclone":
        actions = [
            "Stay indoors and monitor official cyclone warnings",
            "Secure loose objects around buildings",
            "Keep emergency supplies and communication devices ready",
            "Follow evacuation instructions from authorities"
        ]
        avoid = [
            "Avoid unnecessary travel",
            "Stay away from coastal and exposed areas",
            "Do not approach damaged power lines"
        ]

    elif disaster_type == "landslide":
        actions = [
            "Move away from unstable slopes",
            "Monitor local emergency warnings",
            "Keep emergency contacts available",
            "Report blocked roads or visible ground movement"
        ]
        avoid = [
            "Avoid steep slopes and unstable areas",
            "Avoid blocked roads near the affected area"
        ]

    elif disaster_type == "fire":
        actions = [
            "Move away from the affected area",
            "Follow evacuation instructions",
            "Contact emergency services if required",
            "Keep away from smoke and damaged structures"
        ]
        avoid = [
            "Do not enter the affected area",
            "Avoid heavy smoke",
            "Do not approach damaged electrical equipment"
        ]

    elif disaster_type == "heavy rainfall":
        actions = [
            "Monitor rainfall and local warnings",
            "Keep emergency supplies ready",
            "Use safer alternate routes",
            "Stay prepared for possible waterlogging"
        ]
        avoid = [
            "Avoid flooded roads",
            "Avoid unnecessary travel during severe rainfall"
        ]

    else:
        if risk_level == "CRITICAL":
            actions = [
                "Follow official emergency instructions",
                "Prepare emergency supplies",
                "Contact emergency services if assistance is required"
            ]
            avoid = [
                "Avoid unnecessary travel",
                "Avoid dangerous or affected areas"
            ]

        elif risk_level == "HIGH":
            actions = [
                "Monitor official disaster alerts",
                "Keep emergency supplies ready",
                "Follow local safety instructions"
            ]
            avoid = [
                "Avoid unnecessary travel",
                "Avoid affected areas"
            ]

        elif risk_level == "MEDIUM":
            actions = [
                "Monitor local weather conditions",
                "Keep emergency contacts available",
                "Be prepared for changing conditions"
            ]
            avoid = [
                "Avoid unnecessary travel during severe weather"
            ]

        else:
            actions = [
                "Continue normal activities with basic precautions",
                "Monitor weather updates"
            ]
            avoid = [
                "Avoid ignoring sudden changes in weather"
            ]

    return {
        "location": city,
        "disaster_type": disaster_type,
        "risk_level": risk_level,
        "risk_score": risk_score,
        "risk_factors": factors,
        "advisory": {
            "recommended_actions": actions,
            "things_to_avoid": avoid
        }
    }