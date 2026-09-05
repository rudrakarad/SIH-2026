def detect_disaster_type(situation):
    s = (situation or "").lower()
    if any(w in s for w in ["fire", "flame", "smoke", "cylinder", "blast", "burn", "explosion"]):
        return "Fire"
    if any(w in s for w in ["quake", "earthquake", "tremor", "shaking", "collapse", "debris", "crack"]):
        return "Earthquake"
    if any(w in s for w in ["cyclone", "storm", "wind", "gale", "hurricane", "typhoon"]):
        return "Cyclone"
    if any(w in s for w in ["landslide", "mudslide", "mountain", "slope", "rockfall", "ghat"]):
        return "Landslide"
    if any(w in s for w in ["gas", "leak", "toxic", "chemical", "fume", "poison"]):
        return "Gas Leak"
    if any(w in s for w in ["heat", "heatwave", "hot", "sunstroke", "temperature"]):
        return "Heatwave"
    if any(w in s for w in ["cardiac", "chest pain", "heart", "bleeding", "stroke", "unconscious", "medical", "doctor", "hospital"]):
        return "Medical Emergency"
    if any(w in s for w in ["water", "flood", "rain", "submerged", "overflow", "river", "drown", "waterlogging", "lake"]):
        return "Flood"
    return "General"

def create_emergency_plan(
    situation,
    people_affected,
    rescue_teams,
    ambulances,
    hospitals,
    blocked_roads
):
    disaster_category = detect_disaster_type(situation)
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

    # Category-Specific Tailored Protocols
    if disaster_category == "Fire":
        actions.append("🚒 Dispatch fire engines, high-rise ladder platforms, and smoke ventilation squads.")
        actions.append("⚡ Cut off main electrical grids and gas pipelines in the affected block to prevent secondary explosions.")
        actions.append(f"🚨 Evacuate surrounding structures and assist {people_affected} citizens outside the 500m danger perimeter.")
        actions.append("😷 Provide N95 respiratory masks and oxygen support for smoke inhalation victims.")
        actions.append("🚑 Set up an on-site emergency medical triage for burn & trauma treatment.")

    elif disaster_category == "Earthquake":
        actions.append("🏚️ Deploy Urban Search & Rescue (USAR) units with concrete cutters, acoustic sensors, and rescue dogs.")
        actions.append(f"⛺ Erect emergency tent shelters in wide open grounds for {people_affected} displaced residents.")
        actions.append("⚡ Shut off natural gas lines and power grids to prevent post-quake fires.")
        actions.append("🌉 Inspect structural safety of nearby overpasses, bridges, and high-rise structures.")
        actions.append(f"🏥 Reserve emergency trauma beds and blood supplies across {hospitals} nearby hospitals.")

    elif disaster_category == "Cyclone":
        actions.append("🌪️ Issue immediate shelter-in-place warnings; advise public to stay away from glass windows and loose roofs.")
        actions.append("🌲 Pre-position chainsaw tree clearance squads and electrical restoration teams to restore transit.")
        actions.append(f"🌊 Evacuate low-lying hamlets ({people_affected} residents) to fortified cyclone shelters.")
        actions.append("📦 Distribute emergency rations, flashlights, batteries, and potable drinking water canisters.")

    elif disaster_category == "Landslide":
        actions.append("⛰️ Deploy heavy earth-moving excavators and clearing crews for debris on blocked mountain routes.")
        actions.append(f"🚨 Evacuate {people_affected} residents living near unstable hill slopes and river channels immediately.")
        actions.append("🛑 Block high-risk ghat roads and divert traffic to safe alternative routes.")
        actions.append("🛰️ Monitor geological sensors and drone imagery for secondary slope failures.")

    elif disaster_category == "Gas Leak":
        actions.append("☣️ Evacuate all personnel downwind of the gas leak site immediately.")
        actions.append("🚫 Strictly prohibit matches, open flames, or operating electrical switches in the hazardous zone.")
        actions.append("🦺 Deploy Hazmat response teams with chemical suit protection and fogging spray curtains.")
        actions.append(f"🏥 Alert emergency poison centers & {hospitals} hospitals to prepare antidotes and oxygen therapy.")

    elif disaster_category == "Heatwave":
        actions.append("☀️ Open public cooling centers and hydration kiosks across high-density transit zones.")
        actions.append("💧 Distribute Oral Rehydration Salts (ORS) packets and clean drinking water to outdoor workers.")
        actions.append(f"🚑 Mobilize {ambulances} heat-stroke ambulance units equipped with ice packs and IV fluids.")
        actions.append("🛑 Issue advisory to restrict heavy outdoor labor during peak afternoon hours (12 PM – 4 PM).")

    elif disaster_category == "Medical Emergency":
        actions.append("🚑 Dispatch Advanced Life Support (ALS) ambulances equipped with defibrillators and medical oxygen.")
        actions.append(f"🏥 Alert emergency trauma wards across {hospitals} nearby hospitals to reserve ICU beds.")
        actions.append("👨‍⚕️ Deploy mobile medical triage teams for immediate emergency assessment.")
        actions.append("🚦 Establish green emergency traffic corridors to expedite ambulance transit.")

    else:  # Flood or General
        actions.append(f"🌊 Deploy inflatable motorboats and NDRF water rescue teams to assist {people_affected} stranded citizens.")
        actions.append("🚰 Position high-capacity dewatering pumps in submerged low-lying residential sectors.")
        actions.append("⛺ Setup elevated relief camps with food, clean drinking water, and sanitation facilities.")
        actions.append(f"🚧 Mobilize road clearance crews for {blocked_roads} waterlogged transit routes and enforce traffic diversions.")
        actions.append("📢 Broadcast emergency evacuation alerts and distribute water purification tablets.")

    # Resource Shortage Warnings
    if rescue_teams <= 2:
        actions.append("🛟 (Shortage Warning) Requisition additional SDRF / NDRF battalion reinforcements immediately.")
    if ambulances <= 2:
        actions.append("🚑 (Shortage Warning) Request backup ambulances from neighboring district health centers.")
    if blocked_roads >= 3:
        actions.append(f"🚧 (Transit Warning) Mobilize specialized heavy clearance equipment for {blocked_roads} blocked arterial roads.")

    return {
        "situation": situation,
        "disaster_category": disaster_category,
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
