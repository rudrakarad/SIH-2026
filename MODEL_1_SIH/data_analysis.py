import pandas as pd

df = pd.read_csv("disaster_data.csv")

print("Dataset shape:", df.shape)

print("\nColumns:")
print(df.columns)

print("\nMissing values:")
print(df.isnull().sum())

print("\nDuplicate messages:")
print(df["Message"].duplicated().sum())

print("\nDisaster distribution:")
print(df["Disaster"].value_counts())

print("\nUrgency distribution:")
print(df["Urgency"].value_counts())

print("\nFirst 5 rows:")
print(df.head())

