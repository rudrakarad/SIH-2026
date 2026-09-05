import pandas as pd
import speech_recognition as sr

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report


# ==========================================
# 1. LOAD DATASET
# ==========================================

df = pd.read_csv("disaster_data.csv")

print("Dataset shape:", df.shape)


# ==========================================
# 2. INPUT AND OUTPUT
# ==========================================

X = df["Message"]
y = df["Disaster"]


# ==========================================
# 3. SPLIT DATA
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


# ==========================================
# 4. TF-IDF
# ==========================================

vectorizer = TfidfVectorizer(
    ngram_range=(1, 2),
    min_df=1,
    sublinear_tf=True
)

X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)


# ==========================================
# 5. TRAIN MODEL
# ==========================================

model = LogisticRegression(
    max_iter=2000
)

model.fit(X_train_tfidf, y_train)


# ==========================================
# 6. TEST MODEL
# ==========================================

y_pred = model.predict(X_test_tfidf)

accuracy = accuracy_score(y_test, y_pred)

print("\n================================")
print("       SURAKSHAI MODEL")
print("================================")

print("\nAccuracy:", round(accuracy * 100, 2), "%")

print("\nClassification Report:")
print(classification_report(y_test, y_pred, zero_division=0))

# ==========================================
# STEP 3 - URGENCY MODEL
# ==========================================

print("\n================================")
print("       URGENCY MODEL")
print("================================")


# Input = Message
# Output = Urgency

X_urgency = df["Message"]
y_urgency = df["Urgency"]


# Split the data

X_train_u, X_test_u, y_train_u, y_test_u = train_test_split(
    X_urgency,
    y_urgency,
    test_size=0.2,
    random_state=42,
    stratify=y_urgency
)


# Create TF-IDF

urgency_vectorizer = TfidfVectorizer(
    ngram_range=(1, 2),
    min_df=1,
    sublinear_tf=True
)


X_train_u_tfidf = urgency_vectorizer.fit_transform(X_train_u)
X_test_u_tfidf = urgency_vectorizer.transform(X_test_u)


# Train Logistic Regression

urgency_model = LogisticRegression(
    max_iter=2000,
    class_weight="balanced"
)

urgency_model.fit(X_train_u_tfidf, y_train_u)


# Test the model

y_pred_u = urgency_model.predict(X_test_u_tfidf)

urgency_accuracy = accuracy_score(y_test_u, y_pred_u)


print("\nUrgency Accuracy:",
      round(urgency_accuracy * 100, 2), "%")


print("\nUrgency Classification Report:")

print(
    classification_report(
        y_test_u,
        y_pred_u,
        zero_division=0
    )
)


# ==========================================
# 7. TEST YOUR OWN MESSAGE
# ==========================================

# ==========================================
# STEP 7 - VOICE INPUT
# ==========================================

recognizer = sr.Recognizer()

# Give the recognizer more time to understand speech
recognizer.pause_threshold = 3.5
recognizer.non_speaking_duration = 1.0

print("\n================================")
print("       VOICE INPUT")
print("================================")

with sr.Microphone() as source:

    print("🎙️ Adjusting for background noise...")
    recognizer.adjust_for_ambient_noise(source, duration=1)

    print("🎙️ Listening...")
    print("💡 Speak your complete emergency and pause when finished.")

    audio = recognizer.listen(
        source,
        timeout=10,
        phrase_time_limit=60
    )

print("🤖 Converting speech to text...")

try:

    user_message = recognizer.recognize_google(audio)

    print("\n🗣️ You said:")
    print(user_message)

except sr.UnknownValueError:

    print("❌ Sorry, I could not understand the speech.")

    exit()

except sr.RequestError as e:

    print("❌ Speech recognition service error:", e)

    exit()

except sr.WaitTimeoutError:

    print("❌ No speech detected.")

    exit()

# ==========================================
# 7. DISASTER PREDICTION
# ==========================================

message_tfidf = vectorizer.transform([user_message])

prediction = model.predict(message_tfidf)
probabilities = model.predict_proba(message_tfidf)

predicted_disaster = prediction[0]

confidence = max(probabilities[0]) * 100


# ==========================================
# 8. URGENCY PREDICTION
# ==========================================

urgency_message_tfidf = urgency_vectorizer.transform([user_message])

urgency_prediction = urgency_model.predict(
    urgency_message_tfidf
)

urgency_probabilities = urgency_model.predict_proba(
    urgency_message_tfidf
)

predicted_urgency = urgency_prediction[0]

urgency_confidence = max(
    urgency_probabilities[0]
) * 100


# ==========================================
# 9. ASSISTANCE ENGINE
# ==========================================

assistance_map = {
    "Flood": {
        "Low": "Municipal cleanup",
        "Medium": "Pumping equipment",
        "High": "Rescue team",
        "Critical": "Evacuation team"
    },

    "Fire": {
        "Low": "Fire safety inspection",
        "Medium": "Fire brigade",
        "High": "Fire suppression team",
        "Critical": "Emergency fire rescue"
    },

    "Earthquake": {
        "Low": "Safety inspection team",
        "Medium": "Building inspection team",
        "High": "Rescue team",
        "Critical": "Search and rescue team"
    },

    "Landslide": {
        "Low": "Geological monitoring",
        "Medium": "Road clearance team",
        "High": "Rescue team",
        "Critical": "Emergency rescue team"
    },

    "Cyclone": {
        "Low": "Weather monitoring",
        "Medium": "Emergency preparedness team",
        "High": "Evacuation team",
        "Critical": "Emergency rescue team"
    }
}

recommended_assistance = assistance_map[
    predicted_disaster
][predicted_urgency]


# ==========================================
# 10. FINAL RESULT
# ==========================================

print("\n================================")
print("       SURAKSHAI RESULT")
print("================================")

print("🚨 Predicted Disaster:",
      predicted_disaster)

print("📊 Disaster Confidence:",
      round(confidence, 2), "%")

print("⚠️ Predicted Urgency:",
      predicted_urgency)

print("📊 Urgency Confidence:",
      round(urgency_confidence, 2), "%")

print("🆘 Recommended Assistance:",
      recommended_assistance)