import requests
import json
import sys

def test_api():
    url = "http://localhost:8000/predict"
    payload = {
        "weight_kg": 85,
        "age": 30,
        "height_cm": 180,
        "gender": "Male",
        "activity_level": "Moderately Active",
        "dietary_preference": "Indian-Vegetarian",
        "health_goal": "Weight Loss"
    }

    print(f"🚀 Sending request to {url}...")
    print(f"📋 Payload: {json.dumps(payload, indent=2)}")

    try:
        response = requests.post(url, json=payload)
        
        if response.status_code == 200:
            data = response.json()
            print("\n✅ API Call Successful!")
            print(f"🔥 Daily Calories: {data['daily_calories']}")
            print(f"⚠️ Recalibration Message: {data.get('recalibration_msg', 'None')}")
            
            macros = data.get('macros', {})
            print(f"🥩 Protein: {macros.get('protein_g')}g")
            print(f"🍞 Carbs: {macros.get('carbs_g')}g")
            print(f"🥑 Fats: {macros.get('fat_g')}g")

            meal_plan = data.get('meal_plan', {})
            meals = meal_plan.get('meals', [])
            print(f"\n🍽️ Meal Plan Generated: {len(meals)} meals")
            
            if meals:
                first_meal = meals[0]
                print(f"   Sample Meal: {first_meal.get('meal_type')} - {len(first_meal.get('items', []))} items")
                if first_meal.get('items'):
                    first_item = first_meal['items'][0]
                    print(f"   First Item: {first_item.get('food')}")
                    print(f"   Ingredients Found: {'Yes' if first_item.get('ingredients') else 'No'}")
            
            print("\n🎉 SIMULATION PASSED: Backend is fully operational.")
            sys.exit(0)
        else:
            print(f"\n❌ API Error: {response.status_code}")
            print(response.text)
            sys.exit(1)
            
    except Exception as e:
        print(f"\n❌ Connection Failed: {e}")
        print("Make sure python3 app.py is running on port 8000")
        sys.exit(1)

if __name__ == "__main__":
    test_api()
