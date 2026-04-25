import pandas as pd
import joblib
import os

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

# Absolute path (Windows-safe)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
data_path = os.path.join(BASE_DIR, "fraud_dataset.csv")
model_path = os.path.join(BASE_DIR, "fraud_model.pkl")

# Load dataset
df = pd.read_csv(data_path)

# Features & target
X = df.drop("label", axis=1)
y = df["label"]

# Column groups
categorical_cols = ["transactionType", "deviceType", "locationType"]
numerical_cols = ["amount", "transactionHour", "recentTransactionCount", "accountAgeDays"]

# Preprocessing
preprocessor = ColumnTransformer([
    ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_cols),
    ("num", "passthrough", numerical_cols)
])

# Model (improved version)
model = RandomForestClassifier(
    n_estimators=200,
    max_depth=10,
    random_state=42
)

# Pipeline (CRITICAL)
pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("classifier", model)
])

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train
pipeline.fit(X_train, y_train)

# Save FULL pipeline
joblib.dump(pipeline, model_path)

print("Model trained and saved successfully at:", model_path)