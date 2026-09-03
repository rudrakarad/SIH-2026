
def create_emergency_plan(
    situation,
    people_affected,
    rescue_teams,
    ambulances,
    hospitals,
    blocked_roads
):

    resource_pressure = 0

    if people_affected >= 1000:
        resource_pressure += 40
    elif people_affected >= 500:
        resource_pressure += 25
    elif people_affected >= 100:
        resource_pressure += 10

    if rescue_teams <= 2:
        resource_pressure += 20

    if ambulances <= 2:
        resource_pressure += 20

    if blocked_roads >= 3:
        resource_pressure += 20

    if resource_pressure >= 70:
        priority = "CRITICAL"
    elif resource_pressure >= 40:
        priority = "HIGH"
    elif resource_pressure >= 20:
        priority = "MEDIUM"
    else:
        priority = "LOW"

    actions = []

    if people_affected > 0:
        actions.append("Assess and assist affected population")

    if blocked_roads > 0:
        actions.append("Identify alternate routes and clear blocked roads")

    if ambulances <= 2:
        actions.append("Request additional ambulance support")

    if rescue_teams <= 2:
        actions.append("Deploy additional rescue teams if required")

    if hospitals > 0:
        actions.append("Coordinate with nearby hospitals")

    return {
        "situation": situation,
        "people_affected": people_affected,
        "priority": priority,
        "resource_pressure_score": resource_pressure,
        "resources": {
            "rescue_teams": rescue_teams,
            "ambulances": ambulances,
            "hospitals": hospitals,
            "blocked_roads": blocked_roads
        },
        "recommended_actions": actions
    }