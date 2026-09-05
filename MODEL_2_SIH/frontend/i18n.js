/* ==========================================================
   SURAKSHAI i18n Translation Module (English, Hindi, Marathi)
   ========================================================== */

const I18N_TRANSLATIONS = {
    en: {
        // App Header & Nav
        "sys_version": "SYS-v2030",
        "sys_tagline": "AI Emergency Decision & Disaster Command Platform",
        "nav_overview": "OVERVIEW",
        "nav_control_room": "CONTROL ROOM",
        "nav_ml_classifier": "ML CLASSIFIER",
        "nav_surakshai_ai": "SURAKSHAI AI",
        "nav_resource_engine": "RESOURCE ENGINE",
        "nav_gis_advisory": "GIS ADVISORY",
        "nav_smart_alerts": "SMART ALERTS",
        "nav_helplines": "HELPLINES",
        "system_online": "SYSTEM ONLINE",
        "risk_scanning": "RISK: SCANNING",

        // PWA Banner
        "pwa_title": "Install SURAKSHAI Sci-Fi HUD App",
        "pwa_desc": "Deploy to home screen for offline emergency command access",
        "pwa_install_btn": "Install App",

        // Hero Landing Page
        "hero_title": "FUTURISTIC AI DISASTER MANAGEMENT SYSTEM",
        "hero_subtitle": "Real-time weather telemetry, holographic radar risk assessment, ML situation classification & voice-guided emergency response.",
        "hero_quick_city": "Quick Telemetry Focus:",
        "hero_launch_dashboard": "Launch Control Room",
        "hero_activate_ai": "Activate SurakshAI Assistant",
        "hero_feature_weather": "Real-Time Telemetry",
        "hero_feature_weather_desc": "Live Open-Meteo & GFS 48-Hour forecasting.",
        "hero_feature_radar": "Holographic Radar",
        "hero_feature_radar_desc": "Visual disaster tracking blips & risk level metrics.",
        "hero_feature_ml": "ML Telemetry Classifier",
        "hero_feature_ml_desc": "TF-IDF + Logistic Regression classification engine.",
        "hero_feature_voice": "Voice-Guided AI",
        "hero_feature_voice_desc": "Speech-to-text emergency queries with SurakshAI.",

        // Control Room Dashboard
        "dash_title": "REAL-TIME TELEMETRY CONTROL ROOM",
        "dash_subtitle": "Live meteorological sensors, automated risk assessment engine, and GFS forecast model.",
        "dash_city_placeholder": "Enter Indian city (e.g. Mumbai, Delhi, Chennai)...",
        "dash_fetch_btn": "Fetch Telemetry",
        "dash_temp": "Temperature",
        "dash_rain": "Rainfall",
        "dash_wind": "Wind Speed",
        "dash_gust": "Wind Gust",
        "dash_humidity": "Humidity",
        "dash_risk_title": "Automated Risk Telemetry",
        "dash_risk_score": "Risk Score",
        "dash_decision_title": "AI Command Recommendation",
        "dash_early_warning_title": "Early Warning Scanner",
        "dash_gfs_chart_title": "GFS 48-Hour Atmospheric Forecast",

        // ML Classifier
        "ml_title": "ML EMERGENCY SITUATIONAL CLASSIFIER",
        "ml_subtitle": "Classifies emergency messages into disaster categories and calculates response urgency.",
        "ml_mode_text": "Text Input",
        "ml_mode_voice": "Voice Telemetry",
        "ml_input_placeholder": "Type disaster situation (e.g. Heavy flood water entering houses, 50 people trapped)...",
        "ml_sample_label": "Sample Scenarios:",
        "ml_classify_btn": "Run ML Classification",
        "ml_mic_start": "Start Voice Telemetry",
        "ml_mic_listening": "Listening... Speak emergency parameters.",
        "ml_result_title": "Classification Telemetry Results",

        // SurakshAI Chatbot
        "chat_title": "SURAKSHAI AI ASSISTANT",
        "chat_subtitle": "24/7 AI emergency assistant powered by Groq & Gemini for instant safety guidance.",
        "chat_welcome": "Hello! I am SurakshAI, your AI disaster management assistant for India. How can I assist your safety today?",
        "chat_quick_label": "Quick Safety Queries:",
        "chat_input_placeholder": "Type your disaster safety query...",
        "chat_send_btn": "Send Query",
        "chat_thinking": "SurakshAI is analyzing emergency parameters...",

        // Emergency Resource Manager
        "em_title": "DISASTER RESOURCE ALLOCATION ENGINE",
        "em_subtitle": "Simulates resource deployment, squad allocation, and calculates resource bottleneck pressure.",
        "em_situation_label": "Disaster Situation Description",
        "em_affected_label": "People Affected",
        "em_rescue_label": "Available Rescue Teams",
        "em_ambulances_label": "Available Ambulances",
        "em_hospitals_label": "Nearby Hospitals",
        "em_roads_label": "Blocked Transit Roads",
        "em_generate_btn": "Calculate Deployment Plan",
        "em_plan_title": "Emergency Resource Plan",

        // GIS Advisory
        "gis_title": "GIS GEOSPATIAL ADVISORY MAP",
        "gis_subtitle": "Interactive geospatial visualization of high-risk operational zones.",

        // Smart Alerts
        "alert_title": "SMART PERSONALIZED EMERGENCY ALERTS",
        "alert_subtitle": "Targeted emergency notifications tailored to user locations and risk severity.",
        "alert_simulate_btn": "Simulate Smart Alert",

        // Helpline Directory
        "help_title": "NATIONAL EMERGENCY HELPLINE DIRECTORY",
        "help_subtitle": "Direct emergency hotlines available 24/7 across India.",
        "help_national": "National Emergency Number",
        "help_fire": "Fire Services Hotline",
        "help_ambulance": "Ambulance & Medical Emergency",
        "help_ndrf": "NDRF Disaster Rescue Line",
        "help_lpg": "LPG Gas Leak Emergency"
    },

    hi: {
        // App Header & Nav
        "sys_version": "सिस्टम-v2030",
        "sys_tagline": "एआई आपातकालीन निर्णय और आपदा कमान प्लेटफॉर्म",
        "nav_overview": "अवलोकन",
        "nav_control_room": "कंट्रोल रूम",
        "nav_ml_classifier": "एमएल क्लासिफायर",
        "nav_surakshai_ai": "सुरक्षाAI",
        "nav_resource_engine": "संसाधन इंजन",
        "nav_gis_advisory": "जीआईएस सलाह",
        "nav_smart_alerts": "स्मार्ट अलर्ट",
        "nav_helplines": "हेल्पलाइन",
        "system_online": "सिस्टम ऑनलाइन",
        "risk_scanning": "जोखिम: स्कैनिंग",

        // PWA Banner
        "pwa_title": "SURAKSHAI साइंस-फिक्शन HUD ऐप इंस्टॉल करें",
        "pwa_desc": "ऑफ़लाइन आपातकालीन उपयोग के लिए होम स्क्रीन पर जोड़ें",
        "pwa_install_btn": "ऐप इंस्टॉल करें",

        // Hero Landing Page
        "hero_title": "भविष्यवादी एआई आपदा प्रबंधन प्रणाली",
        "hero_subtitle": "वास्तविक समय का मौसम, होलोग्राफिक रडार जोखिम मूल्यांकन, एमएल स्थिति वर्गीकरण और आवाज-निर्देशित प्रतिक्रिया।",
        "hero_quick_city": "त्वरित टेलीमेट्री ध्यान केंद्रित करें:",
        "hero_launch_dashboard": "कंट्रोल रूम खोलें",
        "hero_activate_ai": "सुरक्षाAI सक्रिय करें",
        "hero_feature_weather": "रियल-टाइम टेलीमेट्री",
        "hero_feature_weather_desc": "लाइव ओपन-मेटियो और GFS 48-घंटे का पूर्वानुमान।",
        "hero_feature_radar": "होलोग्राफिक रडार",
        "hero_feature_radar_desc": "आपदा ट्रैकिंग और जोखिम स्तर मेट्रिक्स।",
        "hero_feature_ml": "एमएल क्लासिफायर",
        "hero_feature_ml_desc": "TF-IDF + लॉजिस्टिक रिग्रेशन वर्गीकरण इंजन।",
        "hero_feature_voice": "वॉइस-गाइडेड एआई",
        "hero_feature_voice_desc": "सुरक्षाAI के साथ भाषण-से-पाठ आपातकालीन प्रश्न।",

        // Control Room Dashboard
        "dash_title": "रियल-टाइम टेलीमेट्री कंट्रोल रूम",
        "dash_subtitle": "लाइव मौसम संबंधी सेंसर, स्वचालित जोखिम मूल्यांकन इंजन और पूर्वानुमान मॉडल।",
        "dash_city_placeholder": "भारतीय शहर दर्ज करें (उदा. मुंबई, दिल्ली, चेन्नई)...",
        "dash_fetch_btn": "टेलीमेट्री प्राप्त करें",
        "dash_temp": "तापमान",
        "dash_rain": "वर्षा",
        "dash_wind": "हवा की गति",
        "dash_gust": "हवा का झोंका",
        "dash_humidity": "आर्द्रता",
        "dash_risk_title": "स्वचालित जोखिम टेलीमेट्री",
        "dash_risk_score": "जोखिम स्कोर",
        "dash_decision_title": "एआई कमान सिफारिश",
        "dash_early_warning_title": "प्रारंभिक चेतावनी स्कैनर",
        "dash_gfs_chart_title": "GFS 48-घंटे का वायुमंडलीय पूर्वानुमान",

        // ML Classifier
        "ml_title": "एमएल आपातकालीन स्थिति क्लासिफायर",
        "ml_subtitle": "आपातकालीन संदेशों को आपदा श्रेणियों में वर्गीकृत करता है और प्रतिक्रिया की तात्कालिकता की गणना करता है।",
        "ml_mode_text": "टेक्स्ट इनपुट",
        "ml_mode_voice": "वॉइस टेलीमेट्री",
        "ml_input_placeholder": "आपदा की स्थिति लिखें (उदा. घरों में बाढ़ का पानी घुस रहा है, 50 लोग फंसे हैं)...",
        "ml_sample_label": "नमूना परिदृश्य:",
        "ml_classify_btn": "एमएल वर्गीकरण चलाएं",
        "ml_mic_start": "वॉइस टेलीमेट्री शुरू करें",
        "ml_mic_listening": "सुन रहा है... आपातकालीन पैरामीटर बोलें।",
        "ml_result_title": "वर्गीकरण टेलीमेट्री परिणाम",

        // SurakshAI Chatbot
        "chat_title": "सुरक्षाAI सहायक",
        "chat_subtitle": "त्वरित सुरक्षा मार्गदर्शन के लिए Groq और Gemini द्वारा संचालित 24/7 AI सहायक।",
        "chat_welcome": "नमस्ते! मैं सुरक्षाAI हूँ, भारत के लिए आपका AI आपदा प्रबंधन सहायक। आज मैं आपकी सुरक्षा में कैसे मदद कर सकता हूँ?",
        "chat_quick_label": "त्वरित सुरक्षा प्रश्न:",
        "chat_input_placeholder": "अपना आपदा सुरक्षा प्रश्न लिखें...",
        "chat_send_btn": "प्रश्न भेजें",
        "chat_thinking": "सुरक्षाAI आपातकालीन मापदंडों का विश्लेषण कर रहा है...",

        // Emergency Resource Manager
        "em_title": "आपदा संसाधन आवंटन इंजन",
        "em_subtitle": "संसाधन तैनाती, टीम आवंटन और संसाधन दबाव की गणना करता है।",
        "em_situation_label": "आपदा स्थिति का विवरण",
        "em_affected_label": "प्रभावित लोग",
        "em_rescue_label": "उपलब्ध बचाव दल",
        "em_ambulances_label": "उपलब्ध एम्बुलेंस",
        "em_hospitals_label": "पास के अस्पताल",
        "em_roads_label": "अवरुद्ध सड़कें",
        "em_generate_btn": "तैनाती योजना की गणना करें",
        "em_plan_title": "आपातकालीन संसाधन योजना",

        // GIS Advisory
        "gis_title": "जीआईएस भौगोलिक सलाह नक्शा",
        "gis_subtitle": "उच्च जोखिम वाले परिचालन क्षेत्रों का इंटरेक्टिव जीआईएस दृश्य।",

        // Smart Alerts
        "alert_title": "स्मार्ट व्यक्तिगत आपातकालीन अलर्ट",
        "alert_subtitle": "उपयोगकर्ता स्थानों और जोखिम गंभीरता के अनुसार आपातकालीन सूचनाएं।",
        "alert_simulate_btn": "स्मार्ट अलर्ट अनुकरण करें",

        // Helpline Directory
        "help_title": "राष्ट्रीय आपातकालीन हेल्पलाइन निर्देशिका",
        "help_subtitle": "पूरे भारत में 24/7 उपलब्ध प्रत्यक्ष आपातकालीन हॉटलाइन।",
        "help_national": "राष्ट्रीय आपातकालीन नंबर",
        "help_fire": "अग्निशमन सेवा हॉटलाइन",
        "help_ambulance": "एम्बुलेंस और चिकित्सा आपातकालीन",
        "help_ndrf": "एनडीआरएफ आपदा बचाव लाइन",
        "help_lpg": "एलपीजी गैस रिसाव आपातकालीन"
    },

    mr: {
        // App Header & Nav
        "sys_version": "सिस्टम-v2030",
        "sys_tagline": "एआय आपत्कालीन निर्णय आणि आपत्ती कमांड प्लॅटफॉर्म",
        "nav_overview": "आढावा",
        "nav_control_room": "कंट्रोल रूम",
        "nav_ml_classifier": "एमएल क्लासिफायर",
        "nav_surakshai_ai": "सुरक्षाAI",
        "nav_resource_engine": "संसाधन इंजिन",
        "nav_gis_advisory": "जीआयएस सल्ला",
        "nav_smart_alerts": "स्मार्ट अलर्ट",
        "nav_helplines": "हेल्पलाइन",
        "system_online": "सिस्टम ऑनलाइन",
        "risk_scanning": "धोका: स्कॅनिंग",

        // PWA Banner
        "pwa_title": "SURAKSHAI साय-फाय HUD ॲप इन्स्टॉल करा",
        "pwa_desc": "ऑफलाइन आपत्कालीन वापरासाठी होम स्क्रीनवर जोडा",
        "pwa_install_btn": "ॲप इन्स्टॉल करा",

        // Hero Landing Page
        "hero_title": "भविष्यवादी एआय आपत्ती व्यवस्थापन प्रणाली",
        "hero_subtitle": "रिअल-टाइम हवामान, होलोग्राफिक रडार धोका मूल्यांकन, एमएल परिस्थिती वर्गीकरण आणि व्हॉइस-मार्गदर्शित प्रतिसाद.",
        "hero_quick_city": "जलद टेलिमेट्री लक्ष्य:",
        "hero_launch_dashboard": "कंट्रोल रूम सुरू करा",
        "hero_activate_ai": "सुरक्षाAI सक्रिय करा",
        "hero_feature_weather": "रिअल-टाइम टेलिमेट्री",
        "hero_feature_weather_desc": "थेट ओपन-मेटिओ आणि GFS 48-तासांचा अंदाज.",
        "hero_feature_radar": "होलोग्राफिक रडार",
        "hero_feature_radar_desc": "आपत्ती ट्रॅकिंग आणि धोका पातळी मेट्रिक्स.",
        "hero_feature_ml": "एमएल क्लासिफायर",
        "hero_feature_ml_desc": "TF-IDF + लॉजिस्टिक रिग्रेशन वर्गीकरण इंजिन.",
        "hero_feature_voice": "व्हॉइस-मार्गदर्शित एआय",
        "hero_feature_voice_desc": "सुरक्षाAI सोबत स्पीच-टू-टेक्स्ट आपत्कालीन प्रश्न.",

        // Control Room Dashboard
        "dash_title": "रिअल-टाइम टेलिमेट्री कंट्रोल रूम",
        "dash_subtitle": "थेट हवामान सेन्सर्स, स्वयंचलित धोका मूल्यांकन इंजिन आणि हवामान अंदाज मॉडेल.",
        "dash_city_placeholder": "भारतीय शहर टाका (उदा. मुंबई, पुणे, नागपूर)...",
        "dash_fetch_btn": "टेलिमेट्री मिळवा",
        "dash_temp": "तापमान",
        "dash_rain": "पाऊस",
        "dash_wind": "वाऱ्याचा वेग",
        "dash_gust": "वाऱ्याचा झोत",
        "dash_humidity": "आर्द्रता",
        "dash_risk_title": "स्वयंचलित धोका टेलिमेट्री",
        "dash_risk_score": "धोका स्कोर",
        "dash_decision_title": "एआय कमांड शिफारस",
        "dash_early_warning_title": "पूर्वसूचना स्कॅनर",
        "dash_gfs_chart_title": "GFS 48-तासांचा वातावरणीय अंदाज",

        // ML Classifier
        "ml_title": "एमएल आपत्कालीन परिस्थिती क्लासिफायर",
        "ml_subtitle": "आपत्कालीन संदेशांचे आपत्ती श्रेणींमध्ये वर्गीकरण करते आणि तीव्रतेची गणना करते.",
        "ml_mode_text": "टेक्स्ट इनपुट",
        "ml_mode_voice": "व्हॉइस टेलिमेट्री",
        "ml_input_placeholder": "आपत्तीची परिस्थिती लिहा (उदा. घरात पुराचे पाणी शिरत आहे, 50 लोक अडकले आहेत)...",
        "ml_sample_label": "नमूना परिस्थिती:",
        "ml_classify_btn": "एमएल वर्गीकरण चालवा",
        "ml_mic_start": "व्हॉइस टेलिमेट्री सुरू करा",
        "ml_mic_listening": "ऐकत आहे... आपत्कालीन पॅरामीटर्स बोला.",
        "ml_result_title": "वर्गीकरण टेलिमेट्री निकाल",

        // SurakshAI Chatbot
        "chat_title": "सुरक्षाAI सहाय्यक",
        "chat_subtitle": "त्वरित सुरक्षेसाठी Groq आणि Gemini द्वारे संचलित 24/7 AI सहाय्यक.",
        "chat_welcome": "नमस्कार! मी सुरक्षाAI आहे, भारतासाठी तुमचा AI आपत्ती व्यवस्थापन सहाय्यक. आज मी तुम्हाला कशी मदत करू शकतो?",
        "chat_quick_label": "जलद सुरक्षा प्रश्न:",
        "chat_input_placeholder": "तुमचा आपत्ती सुरक्षा प्रश्न टाका...",
        "chat_send_btn": "प्रश्न पाठवा",
        "chat_thinking": "सुरक्षाAI आपत्कालीन घटकांचे विश्लेषण करत आहे...",

        // Emergency Resource Manager
        "em_title": "आपत्ती संसाधन वाटप इंजिन",
        "em_subtitle": "संसाधन तैनाती, पथक वाटप आणि संसाधन दबावाची गणना करते.",
        "em_situation_label": "आपत्ती परिस्थितीचे वर्णन",
        "em_affected_label": "बाधित नागरिक",
        "em_rescue_label": "उपलब्ध बचाव पथके",
        "em_ambulances_label": "उपलब्ध रुग्णवाहिका",
        "em_hospitals_label": "जवळची रुग्णालये",
        "em_roads_label": "बंद असलेले रस्ते",
        "em_generate_btn": "तैनात्या योजनेची गणना करा",
        "em_plan_title": "आपत्कालीन संसाधन योजना",

        // GIS Advisory
        "gis_title": "जीआयएस भौगोलिक सल्ला नकाशा",
        "gis_subtitle": "उच्च धोक्याच्या क्षेत्रांचे परस्परसंवादी नकाशा दृश्य.",

        // Smart Alerts
        "alert_title": "स्मार्ट वैयक्तिकृत आपत्कालीन अलर्ट",
        "alert_subtitle": "स्थान आणि तीव्रतेनुसार आपत्कालीन सूचना.",
        "alert_simulate_btn": "स्मार्ट अलर्ट सिम्युलेट करा",

        // Helpline Directory
        "help_title": "राष्ट्रीय आपत्कालीन हेल्पलाइन निर्देशिका",
        "help_subtitle": "भारतभरात 24/7 उपलब्ध थेट आपत्कालीन सेवा हॉटलाइन.",
        "help_national": "राष्ट्रीय आपत्कालीन क्रमांक",
        "help_fire": "अग्निशामक दल हॉटलाइन",
        "help_ambulance": "रुग्णवाहिका आणि वैद्यकीय आपत्कालीन",
        "help_ndrf": "एनडीआरएफ आपत्ती बचाव लाइन",
        "help_lpg": "एलपीजी गॅस गळती आपत्कालीन"
    }
};

let currentLanguage = localStorage.getItem("surakshai_lang") || "en";

function setAppLanguage(lang) {
    if (!I18N_TRANSLATIONS[lang]) lang = "en";
    currentLanguage = lang;
    localStorage.setItem("surakshai_lang", lang);

    // Apply translations to data-i18n elements
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach(el => {
        const key = el.getAttribute("data-i18n");
        const translation = I18N_TRANSLATIONS[lang][key];
        if (translation) {
            if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
                el.placeholder = translation;
            } else {
                el.innerText = translation;
            }
        }
    });

    // Update dropdown select elements
    const selects = document.querySelectorAll(".hud-lang-select, #lang-selector");
    selects.forEach(s => s.value = lang);

    // Update language buttons active state
    document.querySelectorAll(".lang-btn").forEach(btn => {
        if (btn.getAttribute("data-lang") === lang) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    // Update html lang attribute
    document.documentElement.lang = lang;
}

function getTranslation(key, defaultText = "") {
    if (I18N_TRANSLATIONS[currentLanguage] && I18N_TRANSLATIONS[currentLanguage][key]) {
        return I18N_TRANSLATIONS[currentLanguage][key];
    }
    return defaultText || (I18N_TRANSLATIONS["en"][key] || key);
}

function getSpeechLang(lang = currentLanguage) {
    switch (lang) {
        case "hi": return "hi-IN";
        case "mr": return "mr-IN";
        default: return "en-IN";
    }
}
