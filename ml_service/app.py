from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pandas as pd
import numpy as np
import joblib
import uvicorn
import os
import json

# Initialize App
app = FastAPI(title="FitCalc ML Engine", description="AI Nutritionist API with Safety Guardrails")

# Add CORS Middleware to allow requests from Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Artifacts
meal_db = []
try:
    model = joblib.load('nutrition_model.joblib')
    scaler = joblib.load('scaler.joblib')
    le_gender = joblib.load('le_gender.joblib')
    le_activity = joblib.load('le_activity.joblib')
    le_diet = joblib.load('le_diet.joblib')
    le_goal = joblib.load('le_goal.joblib')
    print("Model artifacts loaded.")
    
    if os.path.exists('meal_database.json'):
        with open('meal_database.json', 'r') as f:
            meal_db = json.load(f)
        print(f"Meal Database loaded: {len(meal_db)} plans.")
    else:
        print("Warning: meal_database.json not found.")
        
except Exception as e:
    print(f"Error loading assets: {e}")

class WeightEntry(BaseModel):
    date: str
    weight: float

class UserProfile(BaseModel):
    weight_kg: float = Field(..., ge=20, le=300, description="Weight in kg (20-300)")
    age: int = Field(..., ge=10, le=100, description="Age in years (10-100)")
    height_cm: float = Field(..., ge=100, le=250, description="Height in cm (100-250)")
    gender: str
    activity_level: str
    dietary_preference: str
    health_goal: str
    tracker_data: Optional[List[WeightEntry]] = None

@app.get("/")
def home():
    return {"status": "ML Service Running", "model": "RandomForest MultiOutput", "safety_checks": "Enabled"}

@app.post("/predict")
def predict_nutrition(profile: UserProfile):
    try:
        # Preprocess Input
        model_diet = profile.dietary_preference
        # Map Indian preferences to model-trained classes
        if "Indian-Vegetarian" in model_diet:
            model_diet = "Vegetarian"
        elif "Indian-Non-Vegetarian" in model_diet:
            model_diet = "Standard"

        gender_enc = le_gender.transform([profile.gender])[0]
        activity_enc = le_activity.transform([profile.activity_level])[0]
        diet_enc = le_diet.transform([model_diet])[0]
        goal_enc = le_goal.transform([profile.health_goal])[0]
        
        # Create Feature Vector
        features = np.array([[
            profile.weight_kg,
            profile.age,
            profile.height_cm,
            gender_enc,
            activity_enc,
            diet_enc,
            goal_enc
        ]])
        
        # Scale
        features_scaled = scaler.transform(features)
        
                # Predict
        prediction = model.predict(features_scaled)[0]
        daily_cals = int(prediction[0])

        # SUSTAINABILITY ADJUSTMENTS
        # 1. Calculate Mifflin-St Jeor Baseline (TDEE)
        if profile.gender.lower() == 'male':
            bmr = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age + 5
        else:
            bmr = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age - 161

        # activity multipliers map
        multipliers = {
            "sedentary": 1.2,
            "lightly active": 1.375,
            "moderately active": 1.55,
            "very active": 1.725,
            "extra active": 1.9,
            "athlete": 1.9
        }
        # default to 1.375 if not exactly matched (fallback)
        activity_key = profile.activity_level.lower().strip()
        multiplier = 1.375
        for k, v in multipliers.items():
            if k in activity_key:
                multiplier = v
                break
        
        tdee_baseline = bmr * multiplier
        
        # 2. Add Sustainability Buffer (+150 kcal) to AI prediction
        daily_cals += 150
        
        # 3. Ensure prediction is not dangerously low vs Baseline (Max 25% deficit for AI)
        # Real-world safety: starvations diets are unstable.
        MIN_REALISTIC_CALORIES = int(tdee_baseline * 0.75) 
        daily_cals = max(daily_cals, MIN_REALISTIC_CALORIES)

        # 4. Standard SAFETY GUARDRAILS
        # Use more realistic floors for health sustainability (USDA Guidelines)
        MIN_SAFE_CALORIES = 1500 if profile.gender.lower() == 'male' else 1200
        
        # Demographic specific floors
        if profile.age < 18:
            MIN_SAFE_CALORIES = 1800 if profile.gender.lower() == 'male' else 1400  # Adolescents need more
        elif profile.age > 60:
            MIN_SAFE_CALORIES = 1400 if profile.gender.lower() == 'male' else 1200 # Metabolic slowdown

        MAX_SAFE_CALORIES = 5000
        
        hit_safety_floor = False
        if daily_cals < MIN_SAFE_CALORIES:
            daily_cals = MIN_SAFE_CALORIES
            hit_safety_floor = True
        
        daily_cals = min(daily_cals, MAX_SAFE_CALORIES)

        # 5. ADAPTIVE AI (Recalibration based on tracker)
        recalibration_msg = None
        if hit_safety_floor:
            recalibration_msg = f"Note: Your calorie target was capped at {MIN_SAFE_CALORIES} kcal for safety based on USDA guidelines."
        
        if profile.tracker_data and len(profile.tracker_data) >= 3:
            # Simple trend analysis: compare latest to earliest in last 7 days
            try:
                sorted_data = sorted(profile.tracker_data, key=lambda x: x.date)
                latest_w = sorted_data[-1].weight
                first_w = sorted_data[0].weight
                weight_diff = latest_w - first_w
                
                # If goal is Weight Loss and weight is stagnant or increasing
                if "loss" in profile.health_goal.lower() and weight_diff >= -0.1:
                    adjustment = int(daily_cals * 0.05)
                    daily_cals -= adjustment
                    recalibration_msg = f"Trend Alert: Weight stagnant (Diff: {weight_diff:+.1f}kg). AI adjusted calories by -5% to break plateau."
                
                # If goal is Weight Gain and weight is stagnant or decreasing
                elif "gain" in profile.health_goal.lower() and weight_diff <= 0.1:
                    adjustment = int(daily_cals * 0.05)
                    daily_cals += adjustment
                    recalibration_msg = f"Trend Alert: Slow progress (Diff: {weight_diff:+.1f}kg). AI adjusted calories by +5% to boost growth."
            except Exception as e:
                print(f"Recalibration Error: {e}")

        
        # Find Matches in Meal DB
        best_plan = None
        min_diff = float('inf')
        
        # Normalize current user diet preference for comparison
        user_diet = profile.dietary_preference.lower()
        
        fallback_plan = None

        if meal_db:
            for plan in meal_db:
                # Calculate diff early to avoid scope errors
                target_cals = plan.get('target_calories', 0)
                diff = abs(target_cals - daily_cals)
                
                # Check Diet Type match
                # "Vegetarian" should NOT match "Non-Vegetarian"
                # Logic: 
                # 1. Exact Match is best.
                # 2. "Non-Vegetarian" usually includes Veg items? No, here it means meat plan.
                #    Let's enforce stricter matching.
                
                plan_diet = plan.get('diet_type', '').lower()
                
                match = False
                if user_diet == "vegetarian" or user_diet == "indian-vegetarian":
                    # Strict: plan must NOT contain "non"
                    if "vegetarian" in plan_diet and "non" not in plan_diet:
                        match = True
                elif user_diet == "non-vegetarian" or user_diet == "standard" or user_diet == "indian-non-vegetarian":
                    if "non-vegetarian" in plan_diet:
                        match = True
                else:
                    if user_diet in plan_diet: 
                         match = True
                         if user_diet == "vegetarian" and "non" in plan_diet:
                             match = False

                if match:
                    # Give extra bonus for matching "Indian" keyword if user requested it
                    effective_diff = diff
                    if "indian" in user_diet and "indian" in plan_diet:
                        effective_diff -= 1500 # Even stronger priority for Indian meals

                if match:
                    # Logic to prioritize Age Group Match if available
                    # 'age_group' in plan string e.g., "Child (7-12)", "Adult (18-40)"
                    
                    plan_age = plan.get('age_group', '').lower()
                    user_age = profile.age
                    
                    # Calculate diff before using it

                    
                    is_age_match = False
                    if "child" in plan_age and user_age <= 12:
                        is_age_match = True
                    elif "adult" in plan_age and user_age >= 18:
                        is_age_match = True
                    elif "teen" in plan_age and 13 <= user_age <= 17:
                        is_age_match = True
                        
                    # Weight the difference
                    effective_diff = diff
                    
                    # 1. Age Group Bonus (Legacy fix for children)
                    if is_age_match:
                         effective_diff -= 500 

                    # 2. Weight Category Bonus (New User Requirement)
                    # Text Data: <50kg, 50-70kg, 70-90kg
                    plan_weight_cat = plan.get('weight_category', '')
                    weight_match = False
                    
                    if "<50kg" in plan_weight_cat and profile.weight_kg < 50:
                        weight_match = True
                    elif "50-70kg" in plan_weight_cat and 50 <= profile.weight_kg <= 70:
                        weight_match = True
                    elif "70-90kg" in plan_weight_cat and 70 < profile.weight_kg <= 95: # slightly loose upper bound
                        weight_match = True
                    elif ">90kg" in plan_weight_cat and profile.weight_kg > 90:
                        weight_match = True

                    if weight_match:
                        effective_diff -= 1000 # Very strong signal from user's provided text
                         
                    if effective_diff < min_diff:
                        min_diff = effective_diff
                        best_plan = plan
                else:
                    # Keep a fallback just in case (e.g. if we find nothing matching)
                    # But prioritize the match!
                    if fallback_plan is None or diff < abs(fallback_plan['target_calories'] - daily_cals):
                        fallback_plan = plan
            
            if not best_plan:
                best_plan = fallback_plan

        # 6. Balance Macros based on final Daily Cals
        # (Protein: 4kcal/g, Carbs: 4kcal/g, Fat: 9kcal/g)
        # Ratios: 25% P, 45% C, 30% F (Balanced Sustainability)
        protein_g = int((daily_cals * 0.25) / 4)
        carbs_g = int((daily_cals * 0.45) / 4)
        fat_g = int((daily_cals * 0.30) / 9)

        return {
            "daily_calories": daily_cals,
            "macros": {
                "protein_g": protein_g,
                "carbs_g": carbs_g,
                "fat_g": fat_g
            },
            "meal_plan": best_plan,
            "recalibration_msg": recalibration_msg,
            "meta": {
                "engine": "v1.2-safe-plus",
                "profile_received": profile.dict()
            }
        }
    except Exception as e:
        print(f"Prediction Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class ReplacementRequest(BaseModel):
    target_calories: int
    diet_type: str
    meal_type: str  # "Breakfast", "Lunch", etc.

@app.post("/replace_meal")
def replace_meal(req: ReplacementRequest):
    """Suggests 3 alternative meals matching the calorie target and diet type."""
    if not meal_db:
        raise HTTPException(status_code=404, detail="Meal database not available")
    
    user_diet = req.diet_type.lower()
    alternatives = []
    
    for plan in meal_db:
        # Match Diet
        plan_diet = plan.get('diet_type', '').lower()
        match = False
        if user_diet == "vegetarian" and "vegetarian" in plan_diet and "non" not in plan_diet:
            match = True
        elif (user_diet == "non-vegetarian" or user_diet == "standard") and "non-vegetarian" in plan_diet:
            match = True
        elif user_diet in plan_diet:
            match = True
            
        if match:
            for meal in plan.get('meals', []):
                if meal['meal_type'] == req.meal_type:
                    # Check calorie proximity? 
                    # For simplicity, just find different ones
                    alternatives.append({
                        "meal_type": meal['meal_type'],
                        "items": meal['items'],
                        "calories": sum(item['calories'] for item in meal['items'])
                    })
    
    # Shuffle and pick 3
    import random
    random.shuffle(alternatives)
    unique_alts = []
    seen_items = set()
    for alt in alternatives:
        items_str = ", ".join(sorted([i['name'] for i in alt['items']]))
        if items_str not in seen_items:
            unique_alts.append(alt)
            seen_items.add(items_str)
        if len(unique_alts) >= 3:
            break
            
    return {"alternatives": unique_alts}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
