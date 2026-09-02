
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.metrics import classification_report
import pandas as pd

df = pd.read_csv("disaster_data.csv")

print(df.head())
print(df.shape)
print(df.isnull().sum())
print("Duplicate Messages: ", df["Message"].duplicated().sum())

x = df["Message"]
y = df["Disaster"]

x_train, x_test, y_train, y_test = train_test_split(
    x,
    y,
    test_size = 0.2,
    random_state = 42,
    stratify = y
)

vectorizer = TfidfVectorizer()

x_train_tfidf = vectorizer.fit_transform(x_train)
x_test_tfidf = vectorizer.transform(x_test)

model = LogisticRegression(max_iter = 1000)

model.fit(x_train_tfidf, y_train)

y_pred = model.predict(x_test_tfidf)

print(y_pred)

accuracy = accuracy_score(y_test, y_pred)

print("Accuracy: ", accuracy)

print(classification_report(y_test, y_pred, zero_division = 0))

user_message = input("Describe your emergency: ")

message_tfidf = vectorizer.transform([user_message])

prediction = model.predict(message_tfidf)
probabilities = model.predict_proba(message_tfidf)

predicted_disaster = prediction[0]
confidence = max(probabilities[0]) * 100

response_map = {
    "Flood": "Send rescue team and provide evacuation and shelter information.",
    "Fire": "Alert fire brigade and initiate evacuation.",
    "Earthquake": "Send rescue team and conduct building safety inspection.",
    "Medical Emergency": "Contact ambulance and provide emergency medical assistance.",
    "Other": "Forward the request to the appropriate disaster-management authority."
}

predicted_disaster = prediction[0]
print("Predicted Disaster:", predicted_disaster)
print("Confidence:", round(confidence, 2), "%")
print("Recommended Response:", response_map[predicted_disaster])