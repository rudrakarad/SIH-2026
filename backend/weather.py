import requests


# Mumbai coordinates
LATITUDE = 19.0760
LONGITUDE = 72.8777


def get_gfs_forecast():
    url = "https://api.open-meteo.com/v1/gfs"

    params = {
        "latitude": LATITUDE,
        "longitude": LONGITUDE,
        "hourly": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "precipitation,"
            "pressure_msl,"
            "wind_speed_10m,"
            "wind_gusts_10m"
        ),
        "forecast_days": 2,
        "timezone": "Asia/Kolkata"
    }

    response = requests.get(url, params=params, timeout=15)

    response.raise_for_status()

    return response.json()


if __name__ == "__main__":
    data = get_gfs_forecast()

    print("GFS forecast received successfully!")
    print("Location:", data["latitude"], data["longitude"])
    print("First forecast time:", data["hourly"]["time"][0])
    print("Temperature:", data["hourly"]["temperature_2m"][0], "°C")
    print("Rainfall:", data["hourly"]["precipitation"][0], "mm")
    print("Wind:", data["hourly"]["wind_speed_10m"][0], "km/h")