
from datetime import datetime, time


# ----------------------------------------------------
# USER ALERT PREFERENCES
# ----------------------------------------------------

USER_DATABASE = {
    "user_101": {
        "name": "User",
        "preferences": {
            "categories": [
                "flood",
                "cyclone",
                "heavy_rain",
                "heatwave",
                "landslide"
            ],
            "channels": ["push"],
            "quiet_hours": {
                "start": time(22, 0),
                "end": time(7, 0)
            }
        },
        "notification_history": []
    }
}


# ----------------------------------------------------
# SMART ALERT ENGINE
# ----------------------------------------------------

class SmartAlertEngine:

    def __init__(self, user_db, frequency_cap_per_hour=2):
        self.user_db = user_db
        self.freq_cap = frequency_cap_per_hour

    def check_quiet_hours(self, current_time, quiet_hours):

        if not quiet_hours:
            return False

        start = quiet_hours["start"]
        end = quiet_hours["end"]

        if start <= end:
            return start <= current_time.time() <= end

        return current_time.time() >= start or current_time.time() <= end

    def check_frequency_fatigue(self, history, current_time):

        recent_alerts = 0

        for alert in history:

            time_diff = (
                current_time - alert["timestamp"]
            ).total_seconds()

            if 0 <= time_diff < 3600:
                recent_alerts += 1

        return recent_alerts >= self.freq_cap

    def process_alert(self, user_id, category, message, severity):

        user = self.user_db.get(user_id)

        if not user:
            return {
                "status": "ERROR",
                "message": "User not found"
            }

        prefs = user["preferences"]

        current_time = datetime.now()

        # ------------------------------------------------
        # CRITICAL ALERTS BYPASS QUIET HOURS
        # ------------------------------------------------

        if severity != "CRITICAL":

            if category not in prefs["categories"]:

                return {
                    "status": "SKIPPED",
                    "reason": "User is not subscribed to this disaster type"
                }

            if self.check_quiet_hours(
                current_time,
                prefs["quiet_hours"]
            ):

                return {
                    "status": "DELAYED",
                    "reason": "User is currently in quiet hours"
                }

        # ------------------------------------------------
        # NOTIFICATION FATIGUE CHECK
        # ------------------------------------------------

        if self.check_frequency_fatigue(
            user["notification_history"],
            current_time
        ):

            # Critical alerts should still be delivered
            if severity != "CRITICAL":

                return {
                    "status": "SUPPRESSED",
                    "reason": "Too many alerts received recently"
                }

        # ------------------------------------------------
        # SEND ALERT
        # ------------------------------------------------

        user["notification_history"].append({
            "timestamp": current_time,
            "category": category,
            "severity": severity
        })

        return {
            "status": "SENT",
            "user": user["name"],
            "category": category,
            "severity": severity,
            "channels": prefs["channels"],
            "message": message,
            "timestamp": current_time
        }