from flask import Flask, request, jsonify
from flask_cors import CORS  # ✅ Import CORS to fix frontend fetch issues
import joblib
import numpy as np
import pandas as pd

app = Flask(__name__)
CORS(app)  # ✅ Enable CORS for all routes

# Load trained model and scaler
try:
    model = joblib.load("credit_score_model.pkl")
    scaler = joblib.load("scaler.pkl")
    feature_names = joblib.load("feature_names.pkl")  # Load correct feature order
except Exception as e:
    print(f"Error loading model: {e}")

@app.route('/')
def home():
    return jsonify({"message": "Credit Score Prediction API is running!"})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # ✅ Ensure request contains JSON
        if not request.is_json:
            return jsonify({"error": "Invalid request format. Expected JSON."}), 400

        # ✅ Get JSON data from the request
        data = request.get_json()

        # ✅ Validate input structure
        if "features" not in data:
            return jsonify({"error": "Missing 'features' key in JSON data."}), 400

        input_data = np.array([data["features"]])  # Extract features

        # ✅ Convert to DataFrame with correct feature names
        input_df = pd.DataFrame(input_data, columns=feature_names)

        # ✅ Scale the input before prediction
        input_scaled = scaler.transform(input_df)

        # ✅ Predict credit score
        predicted_score = model.predict(input_scaled)

        return jsonify({"predicted_credit_score": float(predicted_score[0])})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)  # ✅ Explicitly set port
