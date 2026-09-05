import speech_recognition as sr

recognizer = sr.Recognizer()

print("================================")
print("       SURAKSHAI")
print("================================")
print("AI Disaster Detection System")
print()

with sr.Microphone() as source:

    print("🎙️ Adjusting for background noise...")
    recognizer.adjust_for_ambient_noise(source, duration=1)

    print("🎙️ Listening...")
    audio = recognizer.listen(source)

print("🤖 Converting speech to text...")

try:
    text = recognizer.recognize_google(audio)

    print()
    print("🗣️ You said:")
    print(text)

except sr.UnknownValueError:
    print("❌ Could not understand the speech.")

except sr.RequestError as e:
    print("❌ Speech recognition service error:", e)