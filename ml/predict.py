import sys
import json
import joblib
import pandas as pd
import os

try:
    # Absolute path (prevents wrong file loading)
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(BASE_DIR, "fraud_model.pkl")

    # Load model
    model = joblib.load(model_path)

    # Read input from Node (CLI)
    input_data = json.loads(sys.argv[1])

    # Convert to DataFrame (REQUIRED for pipeline)
    input_df = pd.DataFrame([{
        "amount": float(input_data["amount"]),
        "transactionType": input_data["transactionType"],
        "deviceType": input_data["deviceType"],
        "locationType": input_data["locationType"],
        "transactionHour": int(input_data["transactionHour"]),
        "recentTransactionCount": int(input_data["recentTransactionCount"]),
        "accountAgeDays": int(input_data["accountAgeDays"])
    }])

    # Prediction
    prediction = model.predict(input_df)[0]

    # Confidence
    if hasattr(model, "predict_proba"):
        prob = model.predict_proba(input_df)[0][1]
    else:
        prob = 0.5

    result = {
        "prediction": "Fraud" if prediction == 1 else "Safe",
        "confidence": round(float(prob), 2)
    }

    print(json.dumps(result))

except Exception as e:
    print(json.dumps({"error": str(e)}))