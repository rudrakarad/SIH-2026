from groq import Groq
from google import genai
from dotenv import load_dotenv
import speech_recognition as sr
import os

# Load API keys
load_dotenv(r"D:\SIH-2026 PRACTICE\.env")

groq_key = os.getenv("GROQ_API_KEY")
gemini_key = os.getenv("GEMINI_API_KEY")

# Create clients
groq_client = Groq(api_key=groq_key)
gemini_client = genai.Client(api_key=gemini_key)

# SurakshAI instructions
system_prompt = """You are SurakshAI, an AI disaster management assistant designed for people in India.

Provide clear, accurate, short, and practical guidance during emergencies and disasters such as earthquakes, floods, fires, cyclones, landslides, lightning, heatwaves, and other emergencies.

Rules:
1. Prioritize human safety.
2. Give simple, actionable instructions.
3. Keep emergency responses concise.
4. Never give dangerous instructions.
5. Never suggest using matches or flames near a suspected gas leak.
6. Give India-appropriate emergency guidance.
7. If the user is in immediate danger, tell them what to do right now first.
8. Do not claim that you contacted emergency services.
9. Do not provide medical diagnoses.
10. Recommend following instructions from local authorities.
11. Respond in the same language as the user whenever possible.
12. Keep responses calm and easy to understand.
"""

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

            interaction = gemini_client.interactions.create(
                model="gemini-3.6-flash",
                input=system_prompt + "\n\nUser: " + question
            )

            answer = interaction.output_text

        except Exception:

            answer = "Sorry, I am currently unable to respond. Please try again later."

    print("\nSurakshAI:", answer)
    print()