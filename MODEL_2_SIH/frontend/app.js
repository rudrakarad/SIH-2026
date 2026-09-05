/* ==========================================
   SURAKSHAI DISASTER MANAGEMENT APP LOGIC
   (100% Standalone In-Browser Engine - No Server Required)
   ========================================== */

const API_BASE = "http://localhost:8000";

let gfsChartInstance = null;
let gisMapInstance = null;
let gisMapMarker = null;

let isListeningML = false;
let speechRecognizerML = null;
let speechRecognizerChat = null;
let useServerBackend = false;

// Assistance Matrix
const ASSISTANCE_MAP = {
    "Flood": { "Low": "Municipal cleanup", "Medium": "Pumping equipment", "High": "Rescue team", "Critical": "Evacuation team" },
    "Fire": { "Low": "Fire safety inspection", "Medium": "Fire brigade", "High": "Fire suppression team", "Critical": "Emergency fire rescue" },
    "Earthquake": { "Low": "Safety inspection team", "Medium": "Building inspection team", "High": "Rescue team", "Critical": "Search and rescue team" },
    "Landslide": { "Low": "Geological monitoring", "Medium": "Road clearance team", "High": "Rescue team", "Critical": "Emergency rescue team" },
    "Cyclone": { "Low": "Weather monitoring", "Medium": "Emergency preparedness team", "High": "Evacuation team", "Critical": "Emergency rescue team" }
};

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
    initTabNavigation();
    initClock();
    checkBackendHealth();

    // Default load Dashboard for Mumbai
    fetchDashboardData("Mumbai");

    // Mode toggles for ML
    document.getElementById("btn-mode-text")?.addEventListener("click", () => switchMLMode("text"));
    document.getElementById("btn-mode-voice")?.addEventListener("click", () => switchMLMode("voice"));
    document.getElementById("btn-start-speech")?.addEventListener("click", toggleVoiceML);
    document.getElementById("btn-run-ml")?.addEventListener("click", runMLClassification);

    // Chatbot Voice
    document.getElementById("btn-chat-voice")?.addEventListener("click", toggleVoiceChat);

    // Fetch button
    document.getElementById("btn-fetch-dashboard")?.addEventListener("click", () => {
        const city = document.getElementById("dashboard-city-input").value.trim() || "Mumbai";
        fetchDashboardData(city);
    });

    // Initialize GIS Map on Advisory tab select
    initGISMap();

    // Register PWA Service Worker for Offline Emergency Access
    registerServiceWorker();
    initPWAInstallPrompt();
});

let deferredPWAInstallPrompt = null;

function registerServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('[PWA] ServiceWorker registered:', reg.scope))
                .catch(err => console.warn('[PWA] ServiceWorker registration failed:', err));
        });
    }
}

function initPWAInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPWAInstallPrompt = e;
        const banner = document.getElementById('pwa-install-banner');
        if (banner) banner.style.display = 'flex';
    });

    document.getElementById('btn-pwa-install')?.addEventListener('click', async () => {
        if (deferredPWAInstallPrompt) {
            deferredPWAInstallPrompt.prompt();
            const { outcome } = await deferredPWAInstallPrompt.userChoice;
            console.log('[PWA] Install choice outcome:', outcome);
            deferredPWAInstallPrompt = null;
            dismissPWABanner();
        }
    });
}

function dismissPWABanner() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) banner.style.display = 'none';
}

/* ==========================================
   HEALTH CHECK & CLOCK
   ========================================== */

async function checkBackendHealth() {
    const statusText = document.getElementById("backend-status-text");
    try {
        const res = await fetch(`${API_BASE}/api/health`, { method: 'GET' });
        const data = await res.json();
        if (data.status === "online") {
            useServerBackend = true;
            statusText.innerText = "FastAPI Backend Online";
            return;
        }
    } catch (e) {
        useServerBackend = false;
        statusText.innerText = "Standalone Local Mode";
    }
}

function initClock() {
    const clockEl = document.getElementById("live-clock");
    setInterval(() => {
        const now = new Date();
        clockEl.innerText = now.toUTCString().slice(17, 25) + " UTC";
    }, 1000);
}

/* ==========================================
   TAB NAVIGATION
   ========================================== */

function initTabNavigation() {
    const tabs = document.querySelectorAll(".nav-tab");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            switchToTab(tab.getAttribute("data-tab"));
        });
    });
}

function switchToTab(targetPaneId) {
    const tabs = document.querySelectorAll(".nav-tab");
    tabs.forEach(t => {
        if (t.getAttribute("data-tab") === targetPaneId) {
            t.classList.add("active");
        } else {
            t.classList.remove("active");
        }
    });

    document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
    const targetPane = document.getElementById(targetPaneId);
    if (targetPane) {
        targetPane.classList.add("active");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Map fix on tab reveal
    if (targetPaneId === "tab-advisory" && gisMapInstance) {
        setTimeout(() => { gisMapInstance.invalidateSize(); }, 200);
    }
}

function quickSelectCity(city) {
    document.getElementById("dashboard-city-input").value = city;
    fetchDashboardData(city);
}

/* ==========================================
   TAB 1: CONTROL ROOM DASHBOARD (CLIENT-SIDE)
   ========================================== */

async function fetchDashboardData(city) {
    try {
        // 1. Geocoding via Open-Meteo
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            alert(`City '${city}' not found.`);
            return;
        }

        const location = geoData.results[0];
        const lat = location.latitude;
        const lon = location.longitude;
        const cityName = location.name;

        // 2. Real-time Weather via Open-Meteo
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m,wind_gusts_10m,weather_code&timezone=Asia%2FKolkata`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();
        const current = weatherData.current || {};

        const weatherObj = {
            location: cityName,
            latitude: lat,
            longitude: lon,
            time: current.time,
            temperature: current.temperature_2m || 0,
            humidity: current.relative_humidity_2m || 0,
            rain: current.rain || 0,
            wind_speed: current.wind_speed_10m || 0,
            wind_gust: current.wind_gusts_10m || 0,
            weather_code: current.weather_code || 0
        };

        // Render Live Weather Card
        document.getElementById("weather-location").innerText = `${cityName}, IN`;
        document.getElementById("weather-temp").innerText = Math.round(weatherObj.temperature);
        document.getElementById("weather-rain").innerText = `${weatherObj.rain} mm`;
        document.getElementById("weather-wind").innerText = `${weatherObj.wind_speed} km/h`;
        document.getElementById("weather-gust").innerText = `${weatherObj.wind_gust} km/h`;
        document.getElementById("weather-humidity").innerText = `${weatherObj.humidity}%`;

        // Update GIS Map position
        updateGISMap(lat, lon, cityName);

        // 3. In-Browser Risk Engine Calculation
        const riskObj = calculateRiskClient(weatherObj);
        updateRiskUI(riskObj, generateEmergencyDecisionClient(weatherObj, riskObj));

        // 4. In-Browser Early Warnings
        const earlyWarningObj = generateEarlyWarningClient(weatherObj, riskObj);
        updateEarlyWarningsUI(earlyWarningObj);

        // 5. GFS 48-Hour Forecast
        fetchGFSForecastClient(lat, lon);

    } catch (err) {
        console.error("Dashboard fetch error:", err);
    }
}

function calculateRiskClient(weather) {
    const rain = weather.rain || 0;
    const wind = weather.wind_speed || 0;
    const gust = weather.wind_gust || 0;
    const humidity = weather.humidity || 0;

    let score = 0;
    const factors = [];

    if (rain >= 50) { score += 40; factors.push("Very heavy rainfall"); }
    else if (rain >= 20) { score += 25; factors.push("Heavy rainfall"); }
    else if (rain >= 5) { score += 10; factors.push("Moderate rainfall"); }

    if (wind >= 60) { score += 30; factors.push("Very strong winds"); }
    else if (wind >= 40) { score += 20; factors.push("Strong winds"); }
    else if (wind >= 25) { score += 10; factors.push("Moderate winds"); }

    if (gust >= 80) { score += 20; factors.push("Extremely strong wind gusts"); }
    else if (gust >= 50) { score += 15; factors.push("Strong wind gusts"); }

    if (humidity >= 90) { score += 10; factors.push("Very high humidity"); }

    let risk_level = "LOW";
    if (score >= 70) risk_level = "CRITICAL";
    else if (score >= 45) risk_level = "HIGH";
    else if (score >= 20) risk_level = "MEDIUM";

    return { risk_level, risk_score: score, risk_factors: factors };
}

function generateEmergencyDecisionClient(weather, risk) {
    const level = risk.risk_level;
    let rec = "";
    if (level === "CRITICAL") {
        rec = "CRITICAL EMERGENCY: Activate disaster response teams immediately, issue public evacuation advisories for low-lying sectors, and prepare emergency relief camps.";
    } else if (level === "HIGH") {
        rec = "HIGH ALERT: Increase local emergency monitoring, alert district NDRF/SDRF teams, and publish precautionary safety guidelines.";
    } else if (level === "MEDIUM") {
        rec = "MODERATE RISK: Continue routine weather monitoring, keep municipal emergency crews on standby, and advise caution on waterlogged transit routes.";
    } else {
        rec = "NORMAL STATUS: Regular meteorological conditions. No immediate emergency deployment required.";
    }
    return { decision: rec };
}

function generateEarlyWarningClient(weather, risk) {
    const warnings = [];
    const rain = weather.rain || 0;
    const wind = weather.wind_speed || 0;
    const gust = weather.wind_gust || 0;
    const temp = weather.temperature || 0;

    if (rain >= 50) {
        warnings.push({ type: "Flood / Extreme Rainfall", severity: "CRITICAL", message: "Extremely heavy rainfall detected. Flooding imminent in low-lying areas.", action: "Move to higher ground and follow emergency evacuation orders." });
    } else if (rain >= 20) {
        warnings.push({ type: "Heavy Rainfall", severity: "HIGH", message: "Heavy rain detected. Local waterlogging and road blockages expected.", action: "Avoid waterlogged underpasses and unnecessary travel." });
    }

    if (wind >= 60 || gust >= 80) {
        warnings.push({ type: "Extreme Wind / Gale", severity: "CRITICAL", message: "Severe gale force winds detected. High hazard for loose roofs & trees.", action: "Stay indoors and keep away from glass windows." });
    } else if (wind >= 40 || gust >= 50) {
        warnings.push({ type: "Strong Wind Gusts", severity: "HIGH", message: "Strong wind gusts active in region.", action: "Secure outdoor objects and exercise driving caution." });
    }

    if (temp >= 40) {
        warnings.push({ type: "Extreme Heatwave", severity: "CRITICAL", message: "Dangerously high temperatures detected.", action: "Maintain hydration and restrict afternoon outdoor labor." });
    }

    return { warning_count: warnings.length, warnings };
}

async function fetchGFSForecastClient(lat, lon) {
    try {
        const url = `https://api.open-meteo.com/v1/gfs?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation,wind_speed_10m&forecast_days=2&timezone=Asia%2FKolkata`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.hourly) {
            renderGFSChart(data.hourly);
        }
    } catch (e) {
        console.error("GFS Forecast error:", e);
    }
}

function updateRiskUI(risk, decision) {
    const levelBadge = document.getElementById("risk-level-badge");
    const globalRiskPill = document.getElementById("global-risk-level");
    const scoreVal = document.getElementById("risk-score-val");
    const factorsUl = document.getElementById("risk-factors-ul");
    const decisionText = document.getElementById("risk-decision-text");

    const level = risk.risk_level || "LOW";
    const score = risk.risk_score || 0;

    levelBadge.innerText = level;
    levelBadge.className = `badge-risk ${level.toLowerCase()}`;

    globalRiskPill.innerText = `RISK: ${level}`;
    scoreVal.innerText = score;

    factorsUl.innerHTML = "";
    if (risk.risk_factors && risk.risk_factors.length > 0) {
        risk.risk_factors.forEach(factor => {
            const li = document.createElement("li");
            li.innerText = factor;
            factorsUl.appendChild(li);
        });
    } else {
        factorsUl.innerHTML = "<li>Normal weather parameters detected</li>";
    }

    decisionText.innerText = decision.decision || "Regular weather monitoring active.";
}

function updateEarlyWarningsUI(earlyWarning) {
    const countTag = document.getElementById("early-warning-count");
    const container = document.getElementById("warning-cards-container");
    const tickerContent = document.getElementById("ticker-content");

    if (!earlyWarning || !earlyWarning.warnings || earlyWarning.warnings.length === 0) {
        countTag.innerText = "0 Active Warnings";
        container.innerHTML = '<div class="empty-state">No critical early warnings active for this region.</div>';
        tickerContent.innerText = "🟢 Weather parameters normal. No severe disaster alerts currently active.";
        return;
    }

    countTag.innerText = `${earlyWarning.warning_count} Active Warnings`;
    container.innerHTML = "";

    const tickerMsgs = [];

    earlyWarning.warnings.forEach(w => {
        const item = document.createElement("div");
        item.className = `warning-card-item ${w.severity}`;
        item.innerHTML = `
            <div>
                <div class="w-title"><i class="fa-solid fa-circle-exclamation text-red"></i> ${w.type} (${w.severity})</div>
                <div class="w-desc">${w.message}</div>
            </div>
            <div class="w-action"><i class="fa-solid fa-shield-halved"></i> ${w.action}</div>
        `;
        container.appendChild(item);
        tickerMsgs.push(`🚨 [${w.severity}] ${w.type}: ${w.message}`);
    });

    tickerContent.innerText = tickerMsgs.join(" | ");
}

function renderGFSChart(hourly) {
    const ctx = document.getElementById("gfs-chart").getContext("2d");

    const times = (hourly.time || []).slice(0, 24).map(t => t.slice(11, 16));
    const temps = (hourly.temperature_2m || []).slice(0, 24);
    const rains = (hourly.precipitation || []).slice(0, 24);
    const winds = (hourly.wind_speed_10m || []).slice(0, 24);

    if (gfsChartInstance) {
        gfsChartInstance.destroy();
    }

    gfsChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: times,
            datasets: [
                { label: 'Temperature (°C)', data: temps, borderColor: '#00f2fe', backgroundColor: 'rgba(0, 242, 254, 0.1)', tension: 0.3, fill: true },
                { label: 'Precipitation (mm)', data: rains, borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', tension: 0.3, fill: true },
                { label: 'Wind Speed (km/h)', data: winds, borderColor: '#f59e0b', tension: 0.3 }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Inter' } } } },
            scales: {
                x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });
}

/* ==========================================
   TAB 2: IN-BROWSER ML CLASSIFIER
   ========================================== */

function switchMLMode(mode) {
    const btnText = document.getElementById("btn-mode-text");
    const btnVoice = document.getElementById("btn-mode-voice");
    const voiceControls = document.getElementById("voice-controls");

    if (mode === "voice") {
        btnVoice.classList.add("active");
        btnText.classList.remove("active");
        voiceControls.style.display = "block";
    } else {
        btnText.classList.add("active");
        btnVoice.classList.remove("active");
        voiceControls.style.display = "none";
    }
}

function setMLSample(text) {
    document.getElementById("ml-message-input").value = text;
}

function toggleVoiceML() {
    const statusText = document.getElementById("speech-status-text");
    const micBtnText = document.getElementById("mic-btn-text");
    const waveBars = document.querySelector(".audio-wave-bars");

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Web Speech API is not supported in this browser. Please use Chrome or Edge.");
        return;
    }

    if (isListeningML) {
        if (speechRecognizerML) speechRecognizerML.stop();
        isListeningML = false;
        micBtnText.innerText = "Start Voice Telemetry";
        statusText.innerText = "Voice telemetry stopped.";
        if (waveBars) waveBars.style.display = "none";
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    speechRecognizerML = new SpeechRecognition();
    speechRecognizerML.lang = "en-IN";

    speechRecognizerML.onstart = () => {
        isListeningML = true;
        micBtnText.innerText = "Listening...";
        statusText.innerText = "🎙️ Telemetry Active... Speak emergency parameters into microphone.";
        if (waveBars) waveBars.style.display = "flex";
    };

    speechRecognizerML.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById("ml-message-input").value = transcript;
        statusText.innerText = `🗣️ Audio Converted: "${transcript}"`;
        isListeningML = false;
        micBtnText.innerText = "Start Voice Telemetry";
        if (waveBars) waveBars.style.display = "none";
    };

    speechRecognizerML.onerror = (event) => {
        statusText.innerText = `❌ Telemetry error: ${event.error}`;
        isListeningML = false;
        micBtnText.innerText = "Start Voice Telemetry";
        if (waveBars) waveBars.style.display = "none";
    };

    speechRecognizerML.start();
}

async function runMLClassification() {
    const inputMsg = document.getElementById("ml-message-input").value.trim();
    const badge = document.getElementById("ml-status-badge");
    const container = document.getElementById("ml-results-body");

    if (!inputMsg) {
        alert("Please enter or record an emergency message first.");
        return;
    }

    badge.innerText = "Classifying...";
    badge.className = "badge-tag";

    // If server backend is online, try API first
    if (useServerBackend) {
        try {
            const res = await fetch(`${API_BASE}/api/ml/predict`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: inputMsg })
            });
            if (res.status === 200) {
                const data = await res.json();
                renderMLResults(data, badge, container);
                return;
            }
        } catch (e) {
            console.warn("Backend ML failed, using client-side ML engine.");
        }
    }

    // In-Browser Client-Side ML Classification Engine
    const clientData = runClientSideMLClassification(inputMsg);
    renderMLResults(clientData, badge, container);
}

function runClientSideMLClassification(msg) {
    const m = msg.toLowerCase();

    // 1. Disaster Category Scores
    const scores = { Flood: 0, Fire: 0, Earthquake: 0, Landslide: 0, Cyclone: 0 };

    if (/(water|flood|rain|submerged|river|overflow|drown|waterlogging|basement|drain|underwater|lake)/.test(m)) scores.Flood += 3;
    if (/(fire|flame|smoke|cylinder|blast|explosion|burn|building fire|trapped in fire)/.test(m)) scores.Fire += 3;
    if (/(quake|earthquake|shaking|tremor|collapse|debris|crack|wall|rubble)/.test(m)) scores.Earthquake += 3;
    if (/(landslide|mudslide|mountain|slope|rockfall|ghat|hillside)/.test(m)) scores.Landslide += 3;
    if (/(cyclone|storm|wind|gale|hurricane|typhoon|roof|tree fall)/.test(m)) scores.Cyclone += 3;

    let predicted_disaster = "Flood";
    let maxDisasterScore = -1;
    for (const [k, v] of Object.entries(scores)) {
        if (v > maxDisasterScore) {
            maxDisasterScore = v;
            predicted_disaster = k;
        }
    }

    // 2. Urgency Scores
    let predicted_urgency = "Medium";
    let urgency_confidence = 74.5;

    if (/(trapped|children|elderly|submerged|unconscious|immediately|collapsed|rescue|dying|urgent)/.test(m)) {
        predicted_urgency = "Critical";
        urgency_confidence = 88.4;
    } else if (/(rising|flooded|heavy|blocked|spreading|highway|danger)/.test(m)) {
        predicted_urgency = "High";
        urgency_confidence = 79.2;
    } else if (/(playground|pool|minor|small|inspection)/.test(m)) {
        predicted_urgency = "Low";
        urgency_confidence = 85.0;
    }

    const disaster_confidence = maxDisasterScore > 0 ? Math.min(95.0, 65.0 + maxDisasterScore * 10.0) : 60.0;
    const recommended_assistance = ASSISTANCE_MAP[predicted_disaster][predicted_urgency] || "Emergency Squad";

    return {
        message: msg,
        predicted_disaster,
        disaster_confidence: roundTwo(disaster_confidence),
        predicted_urgency,
        urgency_confidence: roundTwo(urgency_confidence),
        recommended_assistance
    };
}

function renderMLResults(data, badge, container) {
    badge.innerText = "Classification Complete";
    badge.className = "badge-tag success";

    container.innerHTML = `
        <div class="result-card-box">
            <div class="result-header-title">Predicted Disaster Category</div>
            <div class="result-big-val">
                <span>🚨 ${data.predicted_disaster}</span>
                <span class="confidence-pill">${data.disaster_confidence}% Match</span>
            </div>
        </div>

        <div class="result-card-box">
            <div class="result-header-title">Predicted Urgency Rating</div>
            <div class="result-big-val">
                <span class="badge-risk ${data.predicted_urgency.toLowerCase()}">${data.predicted_urgency}</span>
                <span class="confidence-pill">${data.urgency_confidence}% Match</span>
            </div>
        </div>

        <div class="assistance-box mt-15">
            <h4><i class="fa-solid fa-truck-field-un"></i> Recommended Assistance Squad</h4>
            <p>🆘 ${data.recommended_assistance}</p>
        </div>
    `;
}

/* ==========================================
   TAB 3: IN-BROWSER SURAKSHAI CHATBOT
   ========================================== */

function sendQuickChat(promptText) {
    document.getElementById("chat-input-text").value = promptText;
    sendChatMessage();
}

function toggleVoiceChat() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Speech Recognition is not supported in this browser.");
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    speechRecognizerChat = new SpeechRecognition();
    speechRecognizerChat.lang = "en-IN";

    speechRecognizerChat.onstart = () => {
        document.getElementById("chat-input-text").placeholder = "🎙️ Listening to your voice...";
    };

    speechRecognizerChat.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById("chat-input-text").value = transcript;
        document.getElementById("chat-input-text").placeholder = "Type your disaster query...";
        sendChatMessage();
    };

    speechRecognizerChat.start();
}

async function sendChatMessage() {
    const inputEl = document.getElementById("chat-input-text");
    const msgText = inputEl.value.trim();
    const chatContainer = document.getElementById("chat-messages");

    if (!msgText) return;

    // Append User Bubble
    const userBubble = document.createElement("div");
    userBubble.className = "chat-bubble user-bubble";
    userBubble.innerHTML = `
        <div class="bubble-icon"><i class="fa-solid fa-user"></i></div>
        <div class="bubble-content"><p>${escapeHtml(msgText)}</p></div>
    `;
    chatContainer.appendChild(userBubble);
    inputEl.value = "";
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Append Bot Thinking Bubble
    const botBubble = document.createElement("div");
    botBubble.className = "chat-bubble bot-bubble";
    botBubble.innerHTML = `
        <div class="bubble-icon"><i class="fa-solid fa-robot"></i></div>
        <div class="bubble-content"><p><i class="fa-solid fa-spinner fa-spin"></i> SurakshAI is thinking...</p></div>
    `;
    chatContainer.appendChild(botBubble);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Server check or Client-side Chatbot Engine
    if (useServerBackend) {
        try {
            const res = await fetch(`${API_BASE}/api/chatbot`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: msgText })
            });
            if (res.status === 200) {
                const data = await res.json();
                botBubble.querySelector(".bubble-content").innerHTML = `
                    <strong>SurakshAI (${data.source || 'AI'}):</strong>
                    <p style="white-space: pre-line; margin-top: 4px;">${escapeHtml(data.response)}</p>
                `;
                chatContainer.scrollTop = chatContainer.scrollHeight;
                return;
            }
        } catch (e) {
            console.warn("Backend Chatbot unavailable, using client engine.");
        }
    }

    // In-Browser Client Engine Response
    const reply = getClientSideChatbotResponse(msgText);
    botBubble.querySelector(".bubble-content").innerHTML = `
        <strong>SurakshAI Engine:</strong>
        <p style="white-space: pre-line; margin-top: 4px;">${escapeHtml(reply)}</p>
    `;
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function getClientSideChatbotResponse(q) {
    const m = q.toLowerCase();
    if (/(earthquake|quake|shaking|tremor)/.test(m)) {
        return "🚨 **Earthquake Safety Protocol**:\n1. **Drop, Cover, and Hold On** under a sturdy table or desk.\n2. Stay away from glass windows, heavy light fixtures, and exterior walls.\n3. If outdoors, move to an open field away from buildings, overhead wires, and trees.\n4. Call National Emergency Line **112** if trapped or injured.";
    }
    if (/(flood|water|submerged|overflow|drown)/.test(m)) {
        return "🌊 **Flood Survival Protocol**:\n1. Move immediately to higher ground or upper floors of a sturdy building.\n2. Avoid walking or driving through moving floodwaters (15 cm can knock you down).\n3. Turn off main electrical breakers and gas cylinder valves.\n4. Call NDRF / SDRF Emergency Helpline **112** or **1078** for boat evacuation.";
    }
    if (/(fire|flame|smoke|explosion|burn)/.test(m)) {
        return "🔥 **Fire Emergency Protocol**:\n1. Evacuate immediately using emergency staircases — **NEVER use elevators**.\n2. Stay low to the ground to crawl beneath dangerous smoke.\n3. Check doors with the back of your hand before touching metal handles.\n4. Call Fire Brigade at **101** or Emergency **112**.";
    }
    if (/(gas|leak|lpg|smell|cylinder)/.test(m)) {
        return "☣️ **LPG / Gas Leak Protocol**:\n1. Open all doors and windows immediately for cross-ventilation.\n2. **Do NOT touch any electrical light switches or appliances**.\n3. Never ignite matches or lighter flames.\n4. Shut off cylinder regulator and call LPG Helpline **1906** or **112**.";
    }
    if (/(cyclone|storm|wind|gale)/.test(m)) {
        return "🌪️ **Cyclone & Gale Safety**:\n1. Stay indoors away from windows, glass, and unreinforced roofs.\n2. Keep emergency flashlights, drinking water, and charged mobile phones ready.\n3. Move to designated storm shelters if instructed by authorities.";
    }
    if (/(number|helpline|call|contact|phone)/.test(m)) {
        return "📞 **Essential Emergency Helpline Numbers (India)**:\n- **All-in-One Helpline**: 112\n- **Fire Department**: 101\n- **Ambulance Service**: 108 / 102\n- **NDRF Rescue**: 1078 / 011-24363260\n- **State Control (SDMA)**: 1070\n- **LPG Leak**: 1906";
    }
    return `🚨 **SurakshAI Guidance for '${q}'**:\n1. Prioritize human safety and assess your immediate surroundings.\n2. Move away from hazardous structures or danger zones.\n3. Contact National Emergency Helpline **112** or Disaster Control **1078**.\n4. Follow official advisories from local disaster management authorities.`;
}

/* ==========================================
   TAB 4: IN-BROWSER EMERGENCY PLANNER
   ========================================== */

function generateEmergencyPlan() {
    const situation = document.getElementById("em-situation").value;
    const affected = parseInt(document.getElementById("em-affected").value) || 0;
    const rescue = parseInt(document.getElementById("em-rescue").value) || 0;
    const ambulances = parseInt(document.getElementById("em-ambulances").value) || 0;
    const hospitals = parseInt(document.getElementById("em-hospitals").value) || 0;
    const roads = parseInt(document.getElementById("em-roads").value) || 0;

    const resultBox = document.getElementById("em-plan-result");
    const priorityBadge = document.getElementById("em-priority-badge");

    // In-Browser Emergency Plan Engine
    const s = (situation || "").toLowerCase();
    let disaster_category = "General";

    if (/(fire|flame|smoke|cylinder|blast|explosion)/.test(s)) disaster_category = "Fire";
    else if (/(quake|earthquake|tremor|shaking|collapse)/.test(s)) disaster_category = "Earthquake";
    else if (/(cyclone|storm|wind|gale)/.test(s)) disaster_category = "Cyclone";
    else if (/(landslide|mudslide|mountain|slope)/.test(s)) disaster_category = "Landslide";
    else if (/(gas|leak|toxic|chemical)/.test(s)) disaster_category = "Gas Leak";
    else if (/(water|flood|rain|submerged|overflow)/.test(s)) disaster_category = "Flood";

    let resource_pressure = 0;
    if (affected >= 1000) resource_pressure += 40;
    else if (affected >= 500) resource_pressure += 25;
    else if (affected >= 100) resource_pressure += 10;

    if (rescue <= 2) resource_pressure += 20;
    if (ambulances <= 2) resource_pressure += 20;
    if (roads >= 3) resource_pressure += 20;

    let priority = "LOW";
    if (resource_pressure >= 70) priority = "CRITICAL";
    else if (resource_pressure >= 40) priority = "HIGH";
    else if (resource_pressure >= 20) priority = "MEDIUM";

    priorityBadge.innerText = `PRIORITY: ${priority}`;
    priorityBadge.className = `badge-risk ${priority.toLowerCase()}`;

    const actions = [];
    if (disaster_category === "Fire") {
        actions.push("🚒 Dispatch high-reach fire engines and ventilation squads.");
        actions.push("⚡ Shut off electricity grids & natural gas lines in block.");
        actions.push(`🚨 Evacuate surrounding structures (${affected} citizens outside danger zone).`);
    } else if (disaster_category === "Earthquake") {
        actions.push("🏚️ Deploy USAR concrete cutters, sensors, and rescue k9 units.");
        actions.push(`⛺ Erect emergency tent shelters for ${affected} displaced residents.`);
    } else {
        actions.push(`🌊 Deploy inflatable motorboats and NDRF water rescue teams to assist ${affected} citizens.`);
        actions.push("𚰰 Position high-capacity dewatering pumps in low-lying sectors.");
    }

    if (rescue <= 2) actions.push("🛟 (Shortage Warning) Request NDRF / SDRF battalion reinforcements immediately.");
    if (ambulances <= 2) actions.push("🚑 (Shortage Warning) Mobilize backup ambulances from neighboring districts.");
    if (roads >= 3) actions.push(`🚧 (Transit Warning) Deploy heavy earthmovers to clear ${roads} blocked arterial routes.`);

    let actionsHtml = actions.map(act => `<li style="margin-bottom: 6px;">${act}</li>`).join("");

    resultBox.innerHTML = `
        <div class="result-card-box">
            <div class="result-header-title">Identified Disaster Category</div>
            <div class="result-big-val">
                <span>⚡ ${disaster_category}</span>
                <span class="confidence-pill">Pressure Score: ${resource_pressure}/100</span>
            </div>
        </div>

        <div class="risk-decision-box">
            <h4><i class="fa-solid fa-list-check"></i> Tactical Action Protocol</h4>
            <ul style="padding-left: 18px; font-size: 13px; margin-top: 6px;">
                ${actionsHtml}
            </ul>
        </div>
    `;
}

/* ==========================================
   TAB 5: IN-BROWSER LOCATION ADVISORY & MAP
   ========================================== */

async function fetchLocationAdvisory() {
    const city = document.getElementById("advisory-city").value || "Mumbai";
    const disasterType = (document.getElementById("advisory-type").value || "general").toLowerCase();

    const dosUl = document.getElementById("advisory-dos-ul");
    const dontsUl = document.getElementById("advisory-donts-ul");

    let dos = [];
    let donts = [];

    if (disasterType === "flood") {
        dos = ["Move to higher or elevated structures if waters rise", "Monitor official weather & NDRF warnings", "Keep emergency survival kit & powerbank ready"];
        donts = ["Do NOT attempt to drive or walk through moving floodwaters", "Avoid touching submerged electrical meters"];
    } else if (disasterType === "cyclone") {
        dos = ["Stay indoors away from glass windows & tin roofs", "Keep flashlight & battery radio accessible", "Follow official evacuation orders"];
        donts = ["Avoid unnecessary outdoor travel", "Do NOT approach fallen power cables"];
    } else {
        dos = ["Follow instructions from local disaster authorities", "Keep emergency contacts accessible"];
        donts = ["Avoid unnecessary travel in severe weather", "Do NOT ignore sudden weather warnings"];
    }

    dosUl.innerHTML = dos.map(a => `<li>${a}</li>`).join("");
    dontsUl.innerHTML = donts.map(a => `<li>${a}</li>`).join("");

    // Center map on city using Open-Meteo Geocoding
    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results[0]) {
            const loc = geoData.results[0];
            updateGISMap(loc.latitude, loc.longitude, city);
        }
    } catch (e) {
        console.warn("City geocoding warning:", e);
    }
}

function initGISMap() {
    if (gisMapInstance) return;
    const mapEl = document.getElementById("gis-map");
    if (!mapEl) return;

    gisMapInstance = L.map('gis-map').setView([19.0760, 72.8777], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(gisMapInstance);

    gisMapMarker = L.marker([19.0760, 72.8777]).addTo(gisMapInstance)
        .bindPopup('<b>Mumbai Command Sector</b><br>Disaster Monitoring Active.')
        .openPopup();
}

function updateGISMap(lat, lon, cityName) {
    if (!gisMapInstance) return;
    document.getElementById("map-location-tag").innerText = `${cityName}, India`;
    gisMapInstance.setView([lat, lon], 12);
    if (gisMapMarker) {
        gisMapMarker.setLatLng([lat, lon])
            .bindPopup(`<b>${cityName} Sector</b><br>Active Monitoring Zone.`)
            .openPopup();
    }
}

/* ==========================================
   TAB 6: IN-BROWSER SMART ALERTS
   ========================================== */

function testSmartAlert() {
    const category = document.getElementById("alert-category").value;
    const severity = document.getElementById("alert-severity").value;
    const logBox = document.getElementById("alert-log-box");

    let status = "SENT";
    let message = `Alert for ${category.toUpperCase()} (${severity}): Take safety precautions and monitor official updates.`;

    logBox.innerHTML = `
        <div class="result-card-box" style="border-left: 4px solid var(--accent-emerald)">
            <div class="result-header-title">Engine Filter Status</div>
            <div class="result-big-val">
                <span style="color: var(--accent-emerald);">${status}</span>
                <span class="confidence-pill">${category.toUpperCase()} (${severity})</span>
            </div>
            <p style="font-size: 13px; color: var(--text-main); margin-top: 8px;">
                <strong>Message:</strong> "${message}"
            </p>
        </div>
    `;
}

// Helper functions
function roundTwo(num) {
    return Math.round(num * 100) / 100;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
}
