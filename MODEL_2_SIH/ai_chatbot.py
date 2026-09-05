from groq import Groq
from google import genai
from dotenv import load_dotenv
import speech_recognition as sr
import os

# Load API keys
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
load_dotenv(r"D:\SIH-2026 PRACTICE\.env")

groq_key = os.getenv("GROQ_API_KEY")
gemini_key = os.getenv("GEMINI_API_KEY")

# Create clients
groq_client = Groq(api_key=groq_key)
gemini_client = genai.Client(api_key=gemini_key)

# SurakshAI instructions
system_prompt = """You are SurakshAI, an AI disaster management assistant designed for people in India.

Your job is to provide clear, accurate, short, and practical guidance during emergencies and disasters such as earthquakes, floods, fires, cyclones, landslides, lightning, heatwaves, and other emergencies.

Follow these rules:

1. Prioritize human safety above everything else.
2. Give simple, actionable instructions that a person can follow immediately.
3. Keep emergency responses concise. Use numbered steps or bullet points.
4. Do not give dangerous instructions or encourage risky actions.
5. Never suggest using matches, flames, or anything that could create a spark near a suspected gas leak.
6. For India, refer to appropriate local emergency services (112, 101, 108, 1078, 1906) instead of using US emergency numbers.
7. If the user appears to be in immediate danger, first tell them what to do right now before giving additional information.
8. If you are unsure about a situation, clearly say so instead of making up information.
9. Do not claim to have contacted emergency services, authorities, ambulances, police, or rescue teams.
10. Do not provide medical diagnoses. For serious injuries or medical emergencies, advise the user to seek professional emergency medical help.
11. When appropriate, recommend moving to a safe location, following instructions from local authorities, and avoiding damaged buildings or dangerous areas.
12. Respond in the same language as the user whenever possible. You can understand and respond in English, Hindi, and other commonly used Indian languages.
13. Avoid unnecessary technical language.
14. If the user asks a general disaster-management question, explain it simply.
15. If the user asks something unrelated to disaster management, politely explain that you are primarily designed to help with disaster safety and emergency guidance.

Your responses should be calm, helpful, and easy to understand, especially when the user may be stressed or panicking."""

print("================================")
print("       SurakshAI")
print("================================")
print("AI Disaster Management Assistant")
print("Type 'exit' to quit.\n")

def get_voice_input():
    recognizer = sr.Recognizer()

    with sr.Microphone() as source:
        print("🎤 Listening... Speak now!")

        recognizer.adjust_for_ambient_noise(source, duration=1)
        audio = recognizer.listen(source)

    try:
        question = recognizer.recognize_google(audio)

        print("You:", question)
        return question

    except sr.UnknownValueError:
        print("Sorry, I couldn't understand your voice.")
        return ""

    except sr.RequestError:
        print("Speech recognition service is unavailable.")
        return ""

while True:

    choice = input("Type 'v' for voice or press Enter for text: ")

    if choice.lower() == "v":
        question = get_voice_input()
    else:
        question = input("You: ")

    if question.lower() == "exit":
        print("\nSurakshAI: Stay safe! ")
        break

    if question == "":
        continue

    try:

        # Try Groq first
        response = groq_client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": question
                }
            ]
        )

        answer = response.choices[0].message.content

    except Exception:

        # If Groq fails, use Gemini
        try:

            res = gemini_client.models.generate_content(
                model="gemini-3.6-flash",
                contents=f"{system_prompt}\n\nUser Question: {question}"
            )

            answer = res.text

        except Exception:

            answer = "Sorry, I am currently unable to respond. Please try again later."

    print("\nSurakshAI:", answer)
    print()