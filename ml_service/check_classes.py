import joblib
import os

base_path = "ml_service"
files = ["le_activity.joblib", "le_diet.joblib", "le_gender.joblib", "le_goal.joblib"]

for f in files:
    path = os.path.join(base_path, f)
    if os.path.exists(path):
        le = joblib.load(path)
        print(f"{f}: {le.classes_}")
    else:
        print(f"{f} not found at {path}")
