
def generate_early_warning(weather, risk):

    warnings = []

    rain = weather.get("rain", 0)
    wind = weather.get("wind_speed", 0)
    gust = weather.get("wind_gust", 0)
    humidity = weather.get("humidity", 0)
    temperature = weather.get("temperature", 0)

    risk_level = risk.get("risk_level", "LOW")

    # 🌧️ FLOOD / HEAVY RAINFALL
    if rain >= 50:
        warnings.append({
            "type": "Flood / Extreme Rainfall",
            "severity": "CRITICAL",
            "message": "Extremely heavy rainfall detected. Flooding may occur in vulnerable areas.",
            "action": "Move to safer areas and follow official emergency instructions."
        })

    elif rain >= 20:
        warnings.append({
            "type": "Heavy Rainfall",
            "severity": "HIGH",
            "message": "Heavy rainfall detected. Waterlogging and local flooding are possible.",
            "action": "Avoid flooded roads and monitor local warnings."
        })

    # 🌪️ STRONG WIND / CYCLONE-LIKE CONDITIONS
    if wind >= 60 or gust >= 80:
        warnings.append({
            "type": "Extreme Wind",
            "severity": "CRITICAL",
            "message": "Very strong winds detected. Vulnerable structures and outdoor areas may be at risk.",
            "action": "Stay indoors and secure loose objects."
        })

    elif wind >= 40 or gust >= 50:
        warnings.append({
            "type": "Strong Wind",
            "severity": "HIGH",
            "message": "Strong winds detected. Monitor conditions and secure vulnerable objects.",
            "action": "Avoid unnecessary outdoor travel."
        })

    # 🔥 EXTREME HEAT
    if temperature >= 40:
        warnings.append({
            "type": "Extreme Heat",
            "severity": "CRITICAL",
            "message": "Extremely high temperature detected. Heat-related risks may increase.",
            "action": "Stay hydrated and avoid unnecessary outdoor exposure."
        })

    elif temperature >= 37:
        warnings.append({
            "type": "High Heat",
            "severity": "HIGH",
            "message": "High temperature detected. Heat stress may increase.",
            "action": "Stay hydrated and take precautions during outdoor activities."
        })

    # 💧 VERY HIGH HUMIDITY
    if humidity >= 90:
        warnings.append({
            "type": "Very High Humidity",
            "severity": "MEDIUM",
            "message": "Very high humidity detected. Continue monitoring weather conditions.",
            "action": "Stay hydrated and monitor changing weather conditions."
        })

    # ⚠️ OVERALL DISASTER RISK
    if risk_level == "CRITICAL":
        warnings.append({
            "type": "Overall Disaster Risk",
            "severity": "CRITICAL",
            "message": "Critical disaster risk detected.",
            "action": "Activate emergency preparedness and follow official instructions."
        })

    elif risk_level == "HIGH":
        warnings.append({
            "type": "Overall Disaster Risk",
            "severity": "HIGH",
            "message": "High disaster risk detected.",
            "action": "Increase monitoring and prepare emergency resources."
        })

    return {
        "warning_active": len(warnings) > 0,
        "warning_count": len(warnings),
        "warnings": warnings
    }

def generate_forecast_warning(gfs_data, city="Mumbai"):

    warnings = []

    hourly = gfs_data.get("hourly", {})

    temperatures = hourly.get("temperature_2m", [])
    precipitation = hourly.get("precipitation", [])
    wind_speeds = hourly.get("wind_speed_10m", [])
    wind_gusts = hourly.get("wind_gusts_10m", [])

    # Check upcoming forecast conditions
    for i in range(len(temperatures)):

        rain = precipitation[i] if i < len(precipitation) else 0
        wind = wind_speeds[i] if i < len(wind_speeds) else 0
        gust = wind_gusts[i] if i < len(wind_gusts) else 0
        temperature = temperatures[i]

        # Future heavy rainfall
        if rain >= 20:
            warnings.append({
                "type": "Forecast Heavy Rainfall",
                "location": city,
                "severity": "HIGH",
                "forecast_index": i,
                "message": "Heavy rainfall is forecast in an upcoming period.",
                "action": "Prepare for possible waterlogging and flooding."
            })

        # Future extreme wind
        if wind >= 60 or gust >= 80:
            warnings.append({
                "type": "Forecast Extreme Wind",
                "severity": "CRITICAL",
                "forecast_index": i,
                "message": "Very strong winds are forecast in an upcoming period.",
                "action": "Secure vulnerable structures and follow official warnings."
            })

        # Future extreme heat
        if temperature >= 40:
            warnings.append({
                "type": "Forecast Extreme Heat",
                "location": city,
                "severity": "CRITICAL",
                "forecast_index": i,
                "message": "Extreme heat is forecast in an upcoming period.",
                "action": "Prepare for heat conditions and maintain hydration."
            })

    return {
        "forecast_warning_active": len(warnings) > 0,
        "forecast_warning_count": len(warnings),
        "forecast_warnings": warnings
    }