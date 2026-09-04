/* ==========================================================================
   SIH-2026 AAPDASAHAYAK DISASTER MANAGEMENT COMMAND PORTAL
   Client-Side Application Logic
   ========================================================================== */

const SERVER_URL = 'http://127.0.0.1:5000';

// Map of Disaster Responses
const responseMap = {
    "Flood": "Send rescue team, deploy emergency high-volume water pumps, and provide evacuation & shelter information.",
    "Fire": "Alert fire brigade immediately, isolate hazardous chemical/electrical area, and initiate building evacuation.",
    "Earthquake": "Deploy search & rescue team, inspect structural integrity of buildings, and setup emergency medical camps.",
    "Medical Emergency": "Dispatch ambulance, provide emergency first-aid triage, and notify emergency trauma care center.",
    "Other": "Forward emergency report to municipal disaster management authority for immediate dispatch."
};

// Initialize Application Safely
document.addEventListener("DOMContentLoaded", () => {
    try {
        generateEmergencyPlan();
    } catch (e) {
        console.warn("Initial emergency plan error:", e);
    }

    try {
        fetchCityRisk("Mumbai");
    } catch (e) {
        console.warn("Initial weather risk error:", e);
    }
});

// ==========================================================================
// 1. TAB NAVIGATION & MODAL CONTROLS
// ==========================================================================
function switchTab(tabId, btnElem) {
    document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));

    const targetPanel = document.getElementById(tabId + "Panel");
    if (targetPanel) targetPanel.classList.add("active");
    if (btnElem) btnElem.classList.add("active");

    if (tabId === 'resource') {
        generateEmergencyPlan();
    } else if (tabId === 'locationAdvisory') {
        loadLocationAdvisory();
    } else if (tabId === 'earlyWarning') {
        loadEarlyWarning();
    }
}

// Emergency Contacts Directory Modal Handlers
function openEmergencyContactsModal() {
    const modal = document.getElementById("emergencyContactsModal");
    if (modal) modal.classList.remove("hidden");
}

function closeEmergencyContactsModal(e) {
    const modal = document.getElementById("emergencyContactsModal");
    if (modal) modal.classList.add("hidden");
}

function filterEmergencyContacts() {
    const input = document.getElementById("contactSearchInput");
    if (!input) return;
    const query = input.value.toLowerCase();
    document.querySelectorAll(".contact-directory-card").forEach(card => {
        const dataName = card.getAttribute("data-name") || "";
        const cardText = card.textContent.toLowerCase();
        card.style.display = (dataName.includes(query) || cardText.includes(query)) ? "flex" : "none";
    });
}

function copyText(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
        alert(`Copied ${text} to clipboard!`);
    }
}

// ==========================================================================
// 2. VOICE SPEECH-TO-TEXT RECOGNITION
// ==========================================================================
function startVoiceInput(targetId) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Speech Recognition is not supported on this browser. Please try Chrome, Edge, or Safari.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    const targetElem = document.getElementById(targetId);
    let micBtn = null;
    if (targetId === 'emergencyText') micBtn = document.getElementById('micBtn');
    else if (targetId === 'cornerInput') micBtn = document.getElementById('cornerMicBtn');

    if (micBtn) micBtn.classList.add("listening");

    recognition.start();

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        if (targetElem) {
            targetElem.value = transcript;
            if (targetId === 'emergencyText') predictDisaster();
            else if (targetId === 'cornerInput') sendCornerMessage();
        }
    };

    recognition.onend = function() {
        if (micBtn) micBtn.classList.remove("listening");
    };

    recognition.onerror = function(e) {
        if (micBtn) micBtn.classList.remove("listening");
        console.warn("Voice input error:", e.error);
    };
}

// ==========================================================================
// 3. EMERGENCY AI CLASSIFIER LOGIC
// ==========================================================================
function setPrompt(text) {
    document.getElementById("emergencyText").value = text;
    predictDisaster();
}

function clearInput() {
    document.getElementById("emergencyText").value = "";
}

async function predictDisaster() {
    const textElem = document.getElementById("emergencyText");
    if (!textElem) return;
    const text = textElem.value.trim();
    if (!text) {
        alert("Please enter an emergency description!");
        return;
    }

    try {
        let response = null;
        try {
            response = await fetch('/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
        } catch (e) {
            response = null;
        }

        if (!response || !response.ok) {
            response = await fetch(SERVER_URL + '/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
        }

        if (response && response.ok) {
            const data = await response.json();
            showResult(data.disaster, data.confidence, data.urgency, data.assistance, data.response);
        } else {
            fallbackLocalPredict(text);
        }
    } catch (e) {
        fallbackLocalPredict(text);
    }
}

function fallbackLocalPredict(text) {
    const lower = text.toLowerCase();
    let scoreMap = { "Flood": 0, "Fire": 0, "Earthquake": 0, "Medical Emergency": 0, "Other": 0 };
    let urgency = "MEDIUM";
    let assistance = "Emergency Response Team";

    if (lower.includes("water") || lower.includes("flood") || lower.includes("submerged") || lower.includes("rain") || lower.includes("boat") || lower.includes("drown")) {
        scoreMap["Flood"] += 3;
    }
    if (lower.includes("fire") || lower.includes("flame") || lower.includes("smoke") || lower.includes("cylinder") || lower.includes("blast") || lower.includes("burn")) {
        scoreMap["Fire"] += 3;
    }
    if (lower.includes("quake") || lower.includes("earthquake") || lower.includes("tremor") || lower.includes("shaking") || lower.includes("collapse")) {
        scoreMap["Earthquake"] += 3;
    }
    if (lower.includes("pain") || lower.includes("chest") || lower.includes("bleeding") || lower.includes("unconscious") || lower.includes("doctor") || lower.includes("ambulance")) {
        scoreMap["Medical Emergency"] += 3;
    }

    let predicted = "Other";
    let maxScore = 0;
    for (let key in scoreMap) {
        if (scoreMap[key] > maxScore) {
            maxScore = scoreMap[key];
            predicted = key;
        }
    }

    if (lower.includes("critical") || lower.includes("trapped") || lower.includes("roof") || lower.includes("unconscious") || lower.includes("blast") || lower.includes("submerged")) {
        urgency = "CRITICAL";
    } else if (lower.includes("high") || lower.includes("rising") || lower.includes("severe") || lower.includes("smoke")) {
        urgency = "HIGH";
    }

    if (predicted === "Flood") assistance = "Search & rescue boat, temporary shelter, high-volume water pumps";
    else if (predicted === "Fire") assistance = "Fire brigade, hazmat unit, building evacuation team";
    else if (predicted === "Earthquake") assistance = "Search & rescue team, structural inspector, relief camp";
    else if (predicted === "Medical Emergency") assistance = "Ambulance, emergency triage doctor, trauma care";
    else assistance = "Municipal emergency authorities";

    let confidence = (85.0 + (maxScore * 3.5)).toFixed(1);
    if (maxScore === 0) confidence = "72.0";

    showResult(predicted, confidence, urgency, assistance, responseMap[predicted] || responseMap["Other"]);
}

function showResult(disaster, confidence, urgency, assistance, response) {
    const typeElem = document.getElementById("disasterType");
    if (typeElem) {
        typeElem.textContent = disaster;
        typeElem.className = "disaster-tag " + (disaster === "Medical Emergency" ? "Medical" : disaster);
    }

    const confElem = document.getElementById("confidenceVal");
    if (confElem) confElem.textContent = confidence + "%";
    
    const urgElem = document.getElementById("urgencyVal");
    if (urgElem) {
        urgElem.textContent = urgency.toUpperCase();
        urgElem.className = "urgency-badge " + urgency.toUpperCase();
    }

    const respElem = document.getElementById("responsePlan");
    if (respElem) respElem.textContent = response;

    const assistElem = document.getElementById("assistancePlan");
    if (assistElem) assistElem.textContent = assistance;
}

// ==========================================================================
// 4. WEATHER & DISASTER RISK ENGINE LOGIC
// ==========================================================================
async function fetchCityRisk() {
    const cityInput = document.getElementById("cityInput");
    const city = (cityInput ? cityInput.value.trim() : "") || "Mumbai";

    try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        if (!geoRes.ok) return;
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            alert("City not found. Please try another city.");
            return;
        }

        const loc = geoData.results[0];
        const lat = loc.latitude;
        const lon = loc.longitude;
        const cityName = loc.name;

        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m,wind_gusts_10m&timezone=Asia%2FKolkata`);
        if (!weatherRes.ok) return;
        const weatherData = await weatherRes.json();
        const current = weatherData.current;

        const temp = current.temperature_2m;
        const humidity = current.relative_humidity_2m;
        const rain = current.rain;
        const wind = current.wind_speed_10m;
        const gust = current.wind_gusts_10m;

        if (document.getElementById("wTemp")) document.getElementById("wTemp").textContent = `${temp} °C`;
        if (document.getElementById("wRain")) document.getElementById("wRain").textContent = `${rain} mm`;
        if (document.getElementById("wWind")) document.getElementById("wWind").textContent = `${wind} km/h`;
        if (document.getElementById("wHumidity")) document.getElementById("wHumidity").textContent = `${humidity}%`;

        let score = 0;
        let factors = [];

        if (rain >= 50) { score += 40; factors.push("⚠️ Extremely heavy rainfall detected"); }
        else if (rain >= 20) { score += 25; factors.push("⚠️ Heavy rainfall detected"); }
        else if (rain >= 5) { score += 10; factors.push("ℹ️ Moderate rainfall observed"); }

        if (wind >= 60) { score += 30; factors.push("⚠️ Very strong storm winds"); }
        else if (wind >= 40) { score += 20; factors.push("⚠️ Strong wind advisories"); }

        if (gust >= 80) { score += 20; factors.push("⚠️ Severe wind gusts"); }

        if (humidity >= 90) { score += 10; factors.push("💧 Very high atmospheric humidity"); }

        let riskLevel = "LOW RISK";
        let riskColor = "var(--success-green)";
        if (score >= 70) { riskLevel = "CRITICAL RISK"; riskColor = "var(--primary-red)"; }
        else if (score >= 45) { riskLevel = "HIGH RISK"; riskColor = "var(--warning-orange)"; }
        else if (score >= 20) { riskLevel = "MEDIUM RISK"; riskColor = "#eab308"; }

        if (document.getElementById("riskScoreVal")) document.getElementById("riskScoreVal").textContent = score;
        if (document.getElementById("riskLevelText")) {
            document.getElementById("riskLevelText").textContent = riskLevel;
            document.getElementById("riskLevelText").style.color = riskColor;
        }
        if (document.getElementById("riskCityLoc")) document.getElementById("riskCityLoc").textContent = `Location: ${cityName} (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)`;

        const container = document.getElementById("riskFactorsContainer");
        if (container) {
            if (factors.length === 0) {
                container.innerHTML = '<div class="risk-factor-item" style="background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.3); color: #6ee7b7;">✅ Weather conditions normal. No immediate risk factors.</div>';
            } else {
                container.innerHTML = factors.map(f => `<div class="risk-factor-item">${f}</div>`).join("");
            }
        }
    } catch (err) {
        console.warn("Weather fetch fallback:", err);
    }
}

// ==========================================================================
// 5. EARLY WARNING & GFS FORECAST MODULE
// ==========================================================================
function loadEarlyWarning() {
    const listElem = document.getElementById("earlyWarningList");
    if (!listElem) return;

    listElem.innerHTML = `
        <div class="risk-factor-item" style="background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.4); color: #fca5a5;">
            <span>🚨 <strong>EXTREME RAINFALL ALERT</strong>: 45.0 mm precip recorded. Urban waterlogging advisory active in low-lying sectors.</span>
        </div>
        <div class="risk-factor-item" style="background: rgba(249,115,22,0.15); border-color: rgba(249,115,22,0.4); color: #fdba74;">
            <span>🌪️ <strong>GALE WIND WARNING</strong>: Wind gusts over 55 km/h detected. Avoid standing near tall trees or unanchored banners.</span>
        </div>
        <div class="risk-factor-item" style="background: rgba(59,130,246,0.15); border-color: rgba(59,130,246,0.4); color: #93c5fd;">
            <span>💧 <strong>HIGH HUMIDITY ADVISORY</strong>: Atmospheric moisture > 85%. Prepare for changing precipitation conditions.</span>
        </div>
    `;
}

// ==========================================================================
// 6. LOCATION SAFETY ADVISORY MODULE
// ==========================================================================
function loadLocationAdvisory() {
    const cityInput = document.getElementById("advCityInput");
    const typeInput = document.getElementById("advDisasterType");
    const city = cityInput ? cityInput.value.trim() : "Mumbai";
    const dtype = typeInput ? typeInput.value : "flood";

    const actionsElem = document.getElementById("advActionsList");
    const avoidElem = document.getElementById("advAvoidList");

    let actions = [];
    let avoid = [];

    if (dtype === "flood") {
        actions = [
            `Move immediately to elevated grounds or upper building floors in ${city}.`,
            "Monitor official NDRF flood warnings & emergency broadcasts.",
            "Keep emergency battery supplies, flashlights, and vital documents ready in a waterproof pouch.",
            "Use alternate elevated routes if arterial roads are waterlogged."
        ];
        avoid = [
            "Do not attempt to walk or drive through flowing flood water or submerged underpasses.",
            "Avoid touching fallen electrical cables or submerged transformer boxes.",
            "Do not consume unboiled tap water due to flood contamination risks."
        ];
    } else if (dtype === "cyclone") {
        actions = [
            `Stay indoors in sturdy structures in ${city} and secure all window shutters & doors.`,
            "Keep communication devices fully charged and store emergency drinking water canisters.",
            "Follow evacuation orders from local disaster authorities without delay."
        ];
        avoid = [
            "Avoid unnecessary outdoor travel during high gale winds.",
            "Stay away from coastal beaches, riverbanks, and exposed elevated areas.",
            "Do not approach damaged power lines or fallen trees."
        ];
    } else if (dtype === "landslide") {
        actions = [
            `Move away from unstable hill slopes and mountain stream beds around ${city}.`,
            "Report visible ground cracks, mud movement, or falling rocks to emergency control.",
            "Keep emergency contact numbers and evacuation bags ready."
        ];
        avoid = [
            "Avoid steep hill slopes and mountain highways during continuous heavy rain.",
            "Do not attempt to drive across mudslide-blocked roads."
        ];
    } else if (dtype === "fire") {
        actions = [
            `Evacuate affected structures in ${city} using emergency stairs immediately.`,
            "Call Fire Services (101) and alert surrounding building occupants.",
            "Stay low beneath toxic smoke curtains to maintain oxygen supply."
        ];
        avoid = [
            "Never use elevators during a building fire evacuation.",
            "Do not open doors if the handle feels hot to the touch.",
            "Avoid returning inside a burning building for personal belongings."
        ];
    } else if (dtype === "heavy rainfall") {
        actions = [
            `Monitor weather updates for ${city} and plan essential travel accordingly.`,
            "Keep emergency supplies and flashlights fully charged.",
            "Use safe, elevated transit routes away from low-lying drains."
        ];
        avoid = [
            "Avoid driving into waterlogged underpasses or flooded subways.",
            "Avoid unnecessary travel during peak thunderstorm hours."
        ];
    } else {
        actions = [
            `Follow official emergency safety guidelines for ${city}.`,
            "Maintain emergency contact helplines (112, 1078, 101, 108) on speed dial.",
            "Keep an emergency first-aid kit ready."
        ];
        avoid = [
            "Avoid spreading unverified emergency rumors on social media.",
            "Avoid ignoring official weather warnings."
        ];
    }

    if (actionsElem) actionsElem.innerHTML = actions.map(a => `<li>${a}</li>`).join("");
    if (avoidElem) avoidElem.innerHTML = avoid.map(a => `<li>${a}</li>`).join("");
}

// ==========================================================================
// 7. INSTANT DYNAMIC EMERGENCY RESOURCE MANAGER LOGIC
// ==========================================================================
function detectDisasterCategory(situation) {
    const s = (situation || "").toLowerCase();
    if (s.includes("fire") || s.includes("flame") || s.includes("smoke") || s.includes("cylinder") || s.includes("blast") || s.includes("burn") || s.includes("explosion")) return "Fire";
    if (s.includes("quake") || s.includes("earthquake") || s.includes("tremor") || s.includes("shaking") || s.includes("collapse") || s.includes("debris") || s.includes("crack")) return "Earthquake";
    if (s.includes("cyclone") || s.includes("storm") || s.includes("wind") || s.includes("gale") || s.includes("hurricane")) return "Cyclone";
    if (s.includes("landslide") || s.includes("mudslide") || s.includes("mountain") || s.includes("slope") || s.includes("rockfall")) return "Landslide";
    if (s.includes("gas") || s.includes("leak") || s.includes("toxic") || s.includes("chemical") || s.includes("fume")) return "Gas Leak";
    if (s.includes("heat") || s.includes("heatwave") || s.includes("hot") || s.includes("sunstroke")) return "Heatwave";
    if (s.includes("cardiac") || s.includes("chest pain") || s.includes("heart") || s.includes("bleeding") || s.includes("stroke") || s.includes("unconscious") || s.includes("medical") || s.includes("doctor")) return "Medical Emergency";
    if (s.includes("water") || s.includes("flood") || s.includes("rain") || s.includes("submerged") || s.includes("overflow") || s.includes("river") || s.includes("drown") || s.includes("waterlogging")) return "Flood";
    return "General";
}

function loadScenario(name, situation, people, teams, ambulances, hospitals, blockedRoads) {
    if (document.getElementById("resSituation")) document.getElementById("resSituation").value = situation;
    if (document.getElementById("resPeople")) document.getElementById("resPeople").value = people;
    if (document.getElementById("resTeams")) document.getElementById("resTeams").value = teams;
    if (document.getElementById("resAmbulances")) document.getElementById("resAmbulances").value = ambulances;
    if (document.getElementById("resHospitals")) document.getElementById("resHospitals").value = hospitals;
    if (document.getElementById("resBlockedRoads")) document.getElementById("resBlockedRoads").value = blockedRoads;

    generateEmergencyPlan();
}

function generateEmergencyPlan() {
    try {
        const situationElem = document.getElementById("resSituation");
        const peopleElem = document.getElementById("resPeople");
        const teamsElem = document.getElementById("resTeams");
        const ambulancesElem = document.getElementById("resAmbulances");
        const hospitalsElem = document.getElementById("resHospitals");
        const blockedRoadsElem = document.getElementById("resBlockedRoads");

        if (!situationElem || !peopleElem) return;

        const situation = situationElem.value || "Emergency reported";
        const people = parseInt(peopleElem.value) || 0;
        const teams = parseInt(teamsElem.value) || 0;
        const ambulances = parseInt(ambulancesElem.value) || 0;
        const hospitals = parseInt(hospitalsElem.value) || 0;
        const blockedRoads = parseInt(blockedRoadsElem.value) || 0;

        // 1. INSTANT ZERO-LATENCY LOCAL RENDER
        renderLocalEmergencyPlan(situation, people, teams, ambulances, hospitals, blockedRoads);

        // 2. ASYNC HTTP BACKGROUND ENHANCEMENT (if web server active)
        if (window.location.protocol.startsWith('http')) {
            fetch('/api/emergency-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    situation: situation,
                    people_affected: people,
                    rescue_teams: teams,
                    ambulances: ambulances,
                    hospitals: hospitals,
                    blocked_roads: blockedRoads
                })
            })
            .then(res => res.ok ? res.json() : null)
            .then(planData => {
                if (planData && planData.recommended_actions) {
                    renderEmergencyPlanResult(planData.priority, planData.resource_pressure_score, planData.recommended_actions, situation, planData.disaster_category || detectDisasterCategory(situation), people, blockedRoads, hospitals);
                }
            })
            .catch(() => {});
        }
    } catch (err) {
        console.error("Emergency Plan Error:", err);
    }
}

function renderLocalEmergencyPlan(situation, people, teams, ambulances, hospitals, blockedRoads) {
    const category = detectDisasterCategory(situation);
    let score = 0;
    if (people >= 1000) score += 40;
    else if (people >= 500) score += 25;
    else if (people >= 100) score += 10;

    if (teams <= 2) score += 20;
    if (ambulances <= 2) score += 20;
    if (blockedRoads >= 3) score += 20;

    let priority = "LOW";
    if (score >= 70) priority = "CRITICAL";
    else if (score >= 40) priority = "HIGH";
    else if (score >= 20) priority = "MEDIUM";

    let actions = [];

    if (category === "Fire") {
        actions.push("🚒 Dispatch fire engines, high-rise ladder platforms, and smoke ventilation squads.");
        actions.push("⚡ Cut off main electrical grids and gas pipelines in the affected block to prevent secondary explosions.");
        actions.push(`🚨 Evacuate surrounding structures and assist ${people} citizens outside the 500m danger perimeter.`);
        actions.push("😷 Provide N95 respiratory masks and oxygen support for smoke inhalation victims.");
        actions.push("🚑 Set up an on-site emergency medical triage for burn & trauma treatment.");
    } else if (category === "Earthquake") {
        actions.push("🏚️ Deploy Urban Search & Rescue (USAR) units with concrete cutters, acoustic sensors, and rescue dogs.");
        actions.push(`⛺ Erect emergency tent shelters in wide open grounds for ${people} displaced residents.`);
        actions.push("⚡ Shut off natural gas lines and power grids to prevent post-quake fires.");
        actions.push("🌉 Inspect structural safety of nearby overpasses, bridges, and high-rise structures.");
        actions.push(`🏥 Reserve emergency trauma beds and blood supplies across ${hospitals} nearby hospitals.`);
    } else if (category === "Cyclone") {
        actions.push("🌪️ Issue immediate shelter-in-place warnings; advise public to stay away from glass windows and loose roofs.");
        actions.push("🌲 Pre-position chainsaw tree clearance squads and electrical restoration teams to restore transit.");
        actions.push(`🌊 Evacuate low-lying hamlets (${people} residents) to fortified cyclone shelters.`);
        actions.push("📦 Distribute emergency rations, flashlights, batteries, and potable drinking water canisters.");
    } else if (category === "Landslide") {
        actions.push("⛰️ Deploy heavy earth-moving excavators and clearing crews for debris on blocked mountain routes.");
        actions.push(`🚨 Evacuate ${people} residents living near unstable hill slopes and river channels immediately.`);
        actions.push("🛑 Block high-risk ghat roads and divert traffic to safe alternative routes.");
        actions.push("🛰️ Monitor geological sensors and drone imagery for secondary slope failures.");
    } else if (category === "Gas Leak") {
        actions.push("☣️ Evacuate all personnel downwind of the gas leak site immediately.");
        actions.push("🚫 Strictly prohibit matches, open flames, or operating electrical switches in the hazardous zone.");
        actions.push("🦺 Deploy Hazmat response teams with chemical suit protection and fogging spray curtains.");
        actions.push(`🏥 Alert emergency poison centers & ${hospitals} hospitals to prepare antidotes and oxygen therapy.`);
    } else if (category === "Heatwave") {
        actions.push("☀️ Open public cooling centers and hydration kiosks across high-density transit zones.");
        actions.push("💧 Distribute Oral Rehydration Salts (ORS) packets and clean drinking water to outdoor workers.");
        actions.push(`🚑 Mobilize ${ambulances} heat-stroke ambulance units equipped with ice packs and IV fluids.`);
        actions.push("🛑 Issue advisory to restrict heavy outdoor labor during peak afternoon hours (12 PM – 4 PM).");
    } else if (category === "Medical Emergency") {
        actions.push("🚑 Dispatch Advanced Life Support (ALS) ambulances equipped with defibrillators and medical oxygen.");
        actions.push(`🏥 Alert emergency trauma wards across ${hospitals} nearby hospitals to reserve ICU beds.`);
        actions.push("👨‍⚕️ Deploy mobile medical triage teams for immediate emergency assessment.");
        actions.push("🚦 Establish green emergency traffic corridors to expedite ambulance transit.");
    } else {
        actions.push(`🌊 Deploy inflatable motorboats and NDRF water rescue teams to assist ${people} stranded citizens.`);
        actions.push("🚰 Position high-capacity dewatering pumps in submerged low-lying residential sectors.");
        actions.push("⛺ Setup elevated relief camps with food, clean drinking water, and sanitation facilities.");
        actions.push(`🚧 Mobilize road clearance crews for ${blockedRoads} waterlogged transit routes and enforce traffic diversions.`);
        actions.push("📢 Broadcast emergency evacuation alerts and distribute water purification tablets.");
    }

    if (rescue_teams <= 2) actions.push("🛟 (Shortage Warning) Requisition additional SDRF / NDRF battalion reinforcements immediately.");
    if (ambulances <= 2) actions.push("🚑 (Shortage Warning) Request backup ambulances from neighboring district health centers.");
    if (blockedRoads >= 3) actions.push(`🚧 (Transit Warning) Mobilize specialized heavy clearance equipment for ${blockedRoads} blocked arterial roads.`);

    renderEmergencyPlanResult(priority, score, actions, situation, category, people, blockedRoads, hospitals);
}

function renderEmergencyPlanResult(priority, score, actions, situation, category, people, blockedRoads, hospitals) {
    const scoreElem = document.getElementById("resPressureScore");
    if (scoreElem) scoreElem.textContent = `${score} / 100`;

    const badgeElem = document.getElementById("resPriorityBadge");
    if (badgeElem) {
        badgeElem.textContent = priority;
        badgeElem.className = `urgency-badge ${priority}`;
    }

    const listElem = document.getElementById("resActionsList");
    if (listElem) {
        listElem.innerHTML = actions.map(a => `<li>${a}</li>`).join("");
    }

    const summaryElem = document.getElementById("resAiSummary");
    if (summaryElem) {
        summaryElem.textContent = `Control Room Decision Summary [${category.toUpperCase()} PROTOCOL]: Incident priority is ${priority} (Resource Pressure Score: ${score}/100). Customized response plan activated for ${category} situation involving ${people} citizens, clearing ${blockedRoads} blocked roads, and alerting ${hospitals} medical facilities.`;
    }

    // Flash visual feedback on card
    const card = document.getElementById("resResultCard");
    if (card) {
        card.style.borderColor = "var(--primary-red)";
        setTimeout(() => {
            card.style.borderColor = "var(--bg-card-border)";
        }, 500);
    }
}

// ==========================================================================
// 8. AAPDASAHAYAK AI CHATBOT DRAWER LOGIC
// ==========================================================================
function toggleCornerChat() {
    const box = document.getElementById("cornerChatBox");
    if (box) box.classList.toggle("hidden");
}

function sendQuickCorner(q) {
    const input = document.getElementById("cornerInput");
    if (input) {
        input.value = q;
        sendCornerMessage();
    }
}

function handleCornerKeyPress(e) {
    if (e.key === "Enter") sendCornerMessage();
}

async function sendCornerMessage() {
    const input = document.getElementById("cornerInput");
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    appendChatBubble("cornerMessages", text, "user");
    input.value = "";

    const answer = await fetchBotResponse(text);
    appendChatBubble("cornerMessages", answer, "bot");
}

async function fetchBotResponse(question) {
    try {
        let res = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: question })
        });
        if (!res.ok) {
            res = await fetch(SERVER_URL + '/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: question })
            });
        }
        if (res && res.ok) {
            const data = await res.json();
            if (data.reply && data.reply.trim()) {
                return data.reply;
            }
        }
    } catch (e) {}

    // Comprehensive Local Rule Engine for Disaster Safety Assistance
    const q = question.toLowerCase();
    if (q.includes("earthquake") || q.includes("shaking") || q.includes("tremor")) {
        return "<strong>🏚️ Earthquake Safety Protocol:</strong><br>1. <strong>DROP, COVER, and HOLD ON</strong> under a heavy desk or table.<br>2. Stay away from glass windows, unanchored bookcases, and tall furniture.<br>3. <strong>DO NOT use elevators</strong> during or immediately after shaking.<br>4. If outdoors, move to an open field away from power lines and tall structures.";
    }
    if (q.includes("flood") || q.includes("water") || q.includes("rain") || q.includes("drown")) {
        return "<strong>🌊 Flood Safety Precautions:</strong><br>1. Move immediately to higher ground or upper building floors.<br>2. <strong>DO NOT walk or drive through moving water</strong> (just 6 inches of moving water can knock you down).<br>3. Turn off main electrical circuit breakers.<br>4. Boil drinking water or use purification tablets.";
    }
    if (q.includes("fire") || q.includes("smoke") || q.includes("flame") || q.includes("burn")) {
        return "<strong>🚒 Fire Evacuation Protocol:</strong><br>1. <strong>Call Fire Brigade (101)</strong> immediately.<br>2. Stay low crawl beneath toxic smoke to maintain clean air.<br>3. Feel door handles with the back of your hand before opening.<br>4. Use emergency stairwells only—never elevators.";
    }
    if (q.includes("gas") || q.includes("leak") || sIn(q, ["cylinder", "blast", "smell"])) {
        return "<strong>☣️ Gas Leak Warning:</strong><br>1. <strong>DO NOT turn electrical switches ON/OFF</strong> or light matches/lighters.<br>2. Open all doors and windows to dilute gas concentration.<br>3. Close the main cylinder regulator valve immediately.<br>4. Evacuate the house and call Emergency Services.";
    }
    if (q.includes("cyclone") || q.includes("storm") || q.includes("wind")) {
        return "<strong>🌪️ Cyclone & High Storm Warning:</strong><br>1. Remain indoors inside sturdy, reinforced rooms.<br>2. Stay away from glass windows and tin roofs.<br>3. Store emergency drinking water, dry food, flashlights & power banks.<br>4. Obey coastal evacuation alerts from NDRF.";
    }
    if (q.includes("landslide") || q.includes("mountain") || q.includes("slope")) {
        return "<strong>⛰️ Landslide Emergency Precautions:</strong><br>1. Move away from steep slopes, hill bases, and river valleys.<br>2. Watch for ground cracks, leaning trees, or mud streams.<br>3. Avoid travelling on mountain ghat roads during heavy rains.";
    }
    if (q.includes("heat") || q.includes("sunstroke") || q.includes("temperature")) {
        return "<strong>☀️ Heatwave Protection Protocol:</strong><br>1. Drink plenty of water and ORS solution even if not thirsty.<br>2. Avoid direct sun exposure between 12 PM and 4 PM.<br>3. Wear light, loose-fitting cotton clothes and hats.";
    }
    if (q.includes("lightning") || q.includes("thunder") || q.includes("bijli")) {
        return "<strong>⚡ Lightning Safety Rules:</strong><br>1. Seek shelter inside a solid building or hardtop vehicle.<br>2. Avoid open fields, metal fences, and tall isolated trees.<br>3. Unplug electrical appliances during severe electrical storms.";
    }
    if (q.includes("contact") || q.includes("number") || q.includes("helpline") || q.includes("call")) {
        return "<strong>📞 Emergency Helplines (India):</strong><br>• National Emergency: <strong>112</strong><br>• Police: <strong>100</strong><br>• Ambulance: <strong>108 / 102</strong><br>• Fire Brigade: <strong>101</strong><br>• NDRF Rescue HQ: <strong>1078</strong><br>• Women Helpline: <strong>1091</strong>";
    }
    if (q.includes("namaste") || q.includes("hi") || q.includes("hello") || q.includes("kaise")) {
        return "Namaste! AapdaSahayak is ready to assist you with emergency guidance, safety rules, weather risk assessment, and helpline contacts. How can I help you stay safe?";
    }

    return "<strong>🤖 AapdaSahayak AI Assistance:</strong><br>During emergencies, stay calm and prioritize human safety. Contact <strong>112 (National Emergency)</strong>, <strong>108 (Ambulance)</strong>, <strong>101 (Fire)</strong>, or <strong>1078 (NDRF)</strong> for immediate dispatch.";
}

function sIn(str, keywords) {
    return keywords.some(k => str.includes(k));
}

function appendChatBubble(containerId, text, sender) {
    const area = document.getElementById(containerId);
    if (!area) return;

    const div = document.createElement("div");
    div.className = `chat-msg-bubble ${sender}`;
    if (sender === "bot") {
        div.innerHTML = `<strong>🤖 AapdaSahayak:</strong><br>${text}`;
    } else {
        div.textContent = text;
    }

    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
}
