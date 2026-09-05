
def calculate_risk(weather):

    rain = weather.get("rain", 0)
    wind = weather.get("wind_speed", 0)
    gust = weather.get("wind_gust", 0)
    humidity = weather.get("humidity", 0)

    score = 0
    factors = []

    if rain >= 50:
        score += 40
        factors.append("Very heavy rainfall")
    elif rain >= 20:
        score += 25
        factors.append("Heavy rainfall")
    elif rain >= 5:
        score += 10
        factors.append("Moderate rainfall")

    if wind >= 60:
        score += 30
        factors.append("Very strong winds")
    elif wind >= 40:
        score += 20
        factors.append("Strong winds")
    elif wind >= 25:
        score += 10
        factors.append("Moderate winds")

    if gust >= 80:
        score += 20
        factors.append("Extremely strong wind gusts")
    elif gust >= 50:
        score += 15
        factors.append("Strong wind gusts")

    if humidity >= 90:
        score += 10
        factors.append("Very high humidity")

    if score >= 70:
        risk_level = "CRITICAL"
    elif score >= 45:
        risk_level = "HIGH"
    elif score >= 20:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return {
        "risk_level": risk_level,
        "risk_score": score,
        "risk_factors": factors
    }