/**
 * Frontend-Only Nutrition Engine
 * 100% JavaScript - No backend required
 */

// Core Calculations
function calculateBMR(weight, height, age, gender) {
    const base = (10 * weight) + (6.25 * height) - (5 * age);
    return gender === 'Male' ? base + 5 : base - 161;
}

function calculateTDEE(bmr, activityLevel) {
    const multipliers = {
        'Sedentary': 1.2,
        'Light': 1.375,
        'Moderate': 1.55,
        'Active': 1.725,
        'Very Active': 1.9
    };
    return Math.round(bmr * (multipliers[activityLevel] || 1.2));
}

function calculateMacros(calories, goal) {
    let proteinRatio = 0.30, carbsRatio = 0.40, fatsRatio = 0.30;
    
    if (goal === 'Weight Loss' || goal === 'Extreme Weight Loss') {
        proteinRatio = 0.35; carbsRatio = 0.35; fatsRatio = 0.30;
    } else if (goal === 'Weight Gain') {
        proteinRatio = 0.25; carbsRatio = 0.45; fatsRatio = 0.30;
    }
    
    return {
        protein: Math.round((calories * proteinRatio) / 4),
        carbs: Math.round((calories * carbsRatio) / 4),
        fats: Math.round((calories * fatsRatio) / 9)
    };
}

// Safety Guardrails
function applySafetyLimits(calories, age, weight, gender) {
    let min = 1200, max = 4000;
    if (age < 18) min = 1400;
    if (gender === 'Female' && weight < 50) min = 1300;
    if (gender === 'Male' && weight < 60) min = 1500;
    return Math.max(min, Math.min(calories, max));
}

// Diet Plan Database
const DIET_PLANS = [
    {
        id: 'veg-light',
        name: 'Light Vegetarian Plan',
        dietType: 'Vegetarian',
        targetCalories: 1500,
        weightRange: [40, 60],
        meals: {
            breakfast: [
                { food: 'Poha (flattened rice)', portion: '1 cup', calories: 200 },
                { food: 'Milk', portion: '200ml', calories: 130 }
            ],
            lunch: [
                { food: 'Roti (whole wheat)', portion: '2 pieces', calories: 160 },
                { food: 'Dal (lentils)', portion: '1 cup', calories: 180 },
                { food: 'Mixed vegetables', portion: '1 cup', calories: 100 }
            ],
            snack: [
                { food: 'Fruit (apple/banana)', portion: '1 medium', calories: 100 },
                { food: 'Nuts', portion: '10-12 pieces', calories: 80 }
            ],
            dinner: [
                { food: 'Roti', portion: '2 pieces', calories: 160 },
                { food: 'Paneer curry', portion: '100g', calories: 200 },
                { food: 'Salad', portion: '1 bowl', calories: 50 }
            ]
        }
    },
    {
        id: 'veg-standard',
        name: 'Standard Vegetarian Plan',
        dietType: 'Vegetarian',
        targetCalories: 2000,
        weightRange: [60, 80],
        meals: {
            breakfast: [
                { food: 'Paratha (stuffed)', portion: '2 pieces', calories: 300 },
                { food: 'Curd', portion: '1 cup', calories: 100 },
                { food: 'Milk', portion: '200ml', calories: 130 }
            ],
            lunch: [
                { food: 'Rice', portion: '1.5 cups', calories: 300 },
                { food: 'Dal', portion: '1 cup', calories: 180 },
                { food: 'Mixed vegetables', portion: '1 cup', calories: 100 },
                { food: 'Roti', portion: '1 piece', calories: 80 }
            ],
            snack: [
                { food: 'Samosa', portion: '1 piece', calories: 150 },
                { food: 'Tea', portion: '1 cup', calories: 40 }
            ],
            dinner: [
                { food: 'Roti', portion: '3 pieces', calories: 240 },
                { food: 'Paneer curry', portion: '150g', calories: 280 },
                { food: 'Salad', portion: '1 bowl', calories: 50 }
            ]
        }
    },
    {
        id: 'nonveg-standard',
        name: 'Standard Non-Vegetarian Plan',
        dietType: 'Non-Vegetarian',
        targetCalories: 2000,
        weightRange: [60, 80],
        meals: {
            breakfast: [
                { food: 'Egg omelette (2 eggs)', portion: '1 serving', calories: 200 },
                { food: 'Bread (whole wheat)', portion: '2 slices', calories: 160 },
                { food: 'Milk', portion: '200ml', calories: 130 }
            ],
            lunch: [
                { food: 'Rice', portion: '1.5 cups', calories: 300 },
                { food: 'Chicken curry', portion: '150g', calories: 250 },
                { food: 'Dal', portion: '1 cup', calories: 180 },
                { food: 'Salad', portion: '1 bowl', calories: 50 }
            ],
            snack: [
                { food: 'Fruit', portion: '1 medium', calories: 100 },
                { food: 'Boiled egg', portion: '1', calories: 70 }
            ],
            dinner: [
                { food: 'Roti', portion: '3 pieces', calories: 240 },
                { food: 'Fish curry', portion: '150g', calories: 200 },
                { food: 'Vegetables', portion: '1 cup', calories: 100 }
            ]
        }
    },
    {
        id: 'veg-heavy',
        name: 'High Calorie Vegetarian Plan',
        dietType: 'Vegetarian',
        targetCalories: 2500,
        weightRange: [80, 120],
        meals: {
            breakfast: [
                { food: 'Paratha', portion: '3 pieces', calories: 450 },
                { food: 'Curd', portion: '1 cup', calories: 100 },
                { food: 'Milk', portion: '250ml', calories: 160 }
            ],
            lunch: [
                { food: 'Rice', portion: '2 cups', calories: 400 },
                { food: 'Dal', portion: '1.5 cups', calories: 270 },
                { food: 'Paneer curry', portion: '150g', calories: 280 },
                { food: 'Roti', portion: '2 pieces', calories: 160 }
            ],
            snack: [
                { food: 'Pakora', portion: '4-5 pieces', calories: 200 },
                { food: 'Tea with biscuits', portion: '1 cup + 2', calories: 100 }
            ],
            dinner: [
                { food: 'Roti', portion: '4 pieces', calories: 320 },
                { food: 'Mixed dal', portion: '1 cup', calories: 180 },
                { food: 'Vegetables', portion: '1.5 cups', calories: 150 }
            ]
        }
    },
    {
        id: 'nonveg-heavy',
        name: 'High Calorie Non-Vegetarian Plan',
        dietType: 'Non-Vegetarian',
        targetCalories: 2500,
        weightRange: [80, 120],
        meals: {
            breakfast: [
                { food: 'Egg omelette (3 eggs)', portion: '1 serving', calories: 300 },
                { food: 'Bread', portion: '3 slices', calories: 240 },
                { food: 'Milk', portion: '250ml', calories: 160 }
            ],
            lunch: [
                { food: 'Rice', portion: '2 cups', calories: 400 },
                { food: 'Chicken curry', portion: '200g', calories: 350 },
                { food: 'Dal', portion: '1 cup', calories: 180 },
                { food: 'Roti', portion: '2 pieces', calories: 160 }
            ],
            snack: [
                { food: 'Chicken sandwich', portion: '1', calories: 250 },
                { food: 'Fruit juice', portion: '200ml', calories: 100 }
            ],
            dinner: [
                { food: 'Roti', portion: '3 pieces', calories: 240 },
                { food: 'Mutton curry', portion: '150g', calories: 300 },
                { food: 'Vegetables', portion: '1 cup', calories: 100 }
            ]
        }
    }
];

// Plan Selection
function selectDietPlan(weight, dietType, targetCalories) {
    let candidates = DIET_PLANS.filter(plan => {
        if (dietType === 'Vegetarian') return plan.dietType === 'Vegetarian';
        if (dietType === 'Non-Vegetarian') return plan.dietType === 'Non-Vegetarian';
        return true;
    });
    
    let best = null, bestScore = -Infinity;
    for (const plan of candidates) {
        let score = 0;
        if (weight >= plan.weightRange[0] && weight <= plan.weightRange[1]) score += 1000;
        score -= Math.abs(plan.targetCalories - targetCalories);
        if (score > bestScore) { bestScore = score; best = plan; }
    }
    return best || DIET_PLANS[1];
}

// Main Engine
function calculateNutritionPlan(profile) {
    // Validate
    if (!profile.age || profile.age < 10 || profile.age > 100) {
        return { success: false, error: 'Age must be between 10-100 years' };
    }
    if (!profile.weight || profile.weight < 20 || profile.weight > 300) {
        return { success: false, error: 'Weight must be between 20-300 kg' };
    }
    if (!profile.height || profile.height < 100 || profile.height > 250) {
        return { success: false, error: 'Height must be between 100-250 cm' };
    }
    
    // Calculate
    const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
    const tdee = calculateTDEE(bmr, profile.activityLevel);
    
    let target = tdee;
    if (profile.goal === 'Weight Loss') target = tdee - 500;
    else if (profile.goal === 'Extreme Weight Loss') target = tdee - 1000;
    else if (profile.goal === 'Weight Gain') target = tdee + 500;
    
    const safeCalories = applySafetyLimits(target, profile.age, profile.weight, profile.gender);
    const macros = calculateMacros(safeCalories, profile.goal);
    const plan = selectDietPlan(profile.weight, profile.dietType, safeCalories);
    
    // BMI warning
    const bmi = profile.weight / Math.pow(profile.height / 100, 2);
    let warning = null;
    if (bmi < 18.5) warning = 'Your BMI suggests you may be underweight. Consult a healthcare professional.';
    else if (bmi > 30) warning = 'Your BMI suggests you may be overweight. This is educational only - consult a professional.';
    
    return {
        success: true,
        bmr: Math.round(bmr),
        tdee: tdee,
        targetCalories: safeCalories,
        macros: macros,
        plan: plan,
        warning: warning,
        explanation: [
            { step: 'BMR', value: `${Math.round(bmr)} kcal/day`, detail: `Mifflin-St Jeor for ${profile.gender}, ${profile.age}y, ${profile.weight}kg, ${profile.height}cm` },
            { step: 'TDEE', value: `${tdee} kcal/day`, detail: `Activity: ${profile.activityLevel}` },
            { step: 'Goal', value: profile.goal, detail: `Target: ${safeCalories} kcal/day` },
            { step: 'Plan', value: plan.name, detail: `${profile.dietType}, ${plan.targetCalories} kcal base` }
        ]
    };
}
