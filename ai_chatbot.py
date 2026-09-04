import os
import sys
from groq import Groq
from google import genai
from dotenv import load_dotenv

# Fix Windows console UTF-8 encoding
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Load API keys
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

groq_key = os.getenv("GROQ_API_KEY")
gemini_key = os.getenv("GEMINI_API_KEY")

# Create clients
groq_client = Groq(api_key=groq_key) if groq_key else None
gemini_client = genai.Client(api_key=gemini_key) if gemini_key else None

# AapdaSahayak instructions
system_prompt = """You are AapdaSahayak, an AI disaster management assistant designed for people in India.

Provide clear, accurate, short, and practical guidance during emergencies and disasters such as earthquakes, floods, fires, cyclones, landslides, lightning, heatwaves, and other emergencies.

Rules:
1. Prioritize human safety.
2. Give simple, actionable instructions.
3. Keep emergency responses concise. Use bullet points or numbered lists.
4. Never give dangerous instructions.
5. Never suggest using matches or flames near a suspected gas leak.
6. Give India-appropriate emergency guidance (Helplines: Police 112, Fire 101, Ambulance 108, NDRF 1078).
7. If the user is in immediate danger, tell them what to do right now first.
8. Do not claim that you contacted emergency services.
9. Do not provide medical diagnoses.
10. Recommend following instructions from local authorities.
11. Respond in the same language as the user whenever possible (English, Hindi, Hinglish).
12. Keep responses calm, authoritative, and easy to understand.
"""

def get_bot_response(question):
    if not question or not question.strip():
        return ""

    answer = None

    # Try Groq first
    if groq_client:
        try:
            response = groq_client.chat.completions.create(
                model="openai/gpt-oss-20b",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": question}
                ]
            )
            if response and response.choices:
                answer = response.choices[0].message.content
        except Exception as e:
            print(f"[AI Chatbot] Groq attempt failed: {e}")

    # Fallback to Gemini if Groq fails or is unconfigured
    if not answer and gemini_client:
        try:
            response = gemini_client.models.generate_content(
                model="gemini-3.6-flash",
                contents=system_prompt + "\n\nUser Question: " + question
            )
            if response and response.text:
                answer = response.text
        except Exception as e:
            print(f"[AI Chatbot] Gemini attempt failed: {e}")

    if not answer:
        q = question.lower()
        if "earthquake" in q or "shaking" in q or "tremor" in q:
            answer = "🏚️ **Earthquake Safety Protocol:**\n1. DROP, COVER, and HOLD ON under a heavy desk or table.\n2. Stay away from glass windows and tall furniture.\n3. Do NOT use elevators.\n4. If outdoors, move to an open area away from power lines and tall structures."
        elif "flood" in q or "water" in q or "rain" in q:
            answer = "🌊 **Flood Emergency Precautions:**\n1. Move immediately to higher ground or upper building floors.\n2. Do NOT walk or drive through moving water.\n3. Turn off main electrical circuit breakers.\n4. Boil drinking water or use purification tablets."
        elif "fire" in q or "smoke" in q or "burn" in q:
            answer = "🚒 **Fire Evacuation Protocol:**\n1. Call Fire Brigade (101) immediately.\n2. Crawl low beneath smoke to maintain clean air.\n3. Feel door handles before opening.\n4. Use emergency stairwells only—never elevators."
        elif "gas" in q or "leak" in q:
            answer = "☣️ **Gas Leak Warning:**\n1. Do NOT operate electrical switches or light matches.\n2. Open all doors and windows for ventilation.\n3. Close the cylinder regulator valve immediately.\n4. Evacuate and call Emergency Services (112 / 101)."
        else:
            answer = "🤖 **AapdaSahayak Assistant:**\nStay calm during emergencies and follow local safety advisories. Helpline numbers in India: Police **112**, Ambulance **108**, Fire **101**, NDRF **1078**."

    return answer

ask_aapda_sahayak = get_bot_response

if __name__ == "__main__":
    print("================================")
    print("       AAPDASAHAYAK AI")
    print("================================")
    print(get_bot_response("What to do during an earthquake?"))