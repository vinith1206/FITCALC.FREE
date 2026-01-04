# ML Nutrition Engine

This Python service provides Machine Learning-powered diet recommendations based on the `nutrition_profiles.csv` dataset.

## Setup

1.  **Install Requirements**:
    ```bash
    pip install pandas numpy scikit-learn fastapi uvicorn joblib
    ```

2.  **Generate Data (If needed)**:
    ```bash
    python3 generate_data.py
    ```

3.  **Train Model**:
    ```bash
    python3 train_model.py
    ```
    This creates `.joblib` files (model, scalers, encoders).

4.  **Run API**:
    ```bash
    python3 app.py
    ```
    The API will run at `http://0.0.0.0:8000`.

## API Usage

**Endpoint**: `POST /predict`

**Payload**:
```json
{
  "weight_kg": 75.0,
  "age": 25,
  "height_cm": 180.0,
  "gender": "Male",
  "activity_level": "Moderately Active",
  "dietary_preference": "Keto",
  "health_goal": "Weight Loss"
}
```

**Response**:
```json
{
  "daily_calories": 2105,
  "macros": {
    "protein_g": 131,
    "carbs_g": 26,
    "fat_g": 163
  }
}
```
