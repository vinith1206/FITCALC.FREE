/**
 * Simple Rule-Based Diet Generator
 */

const DIET_DATA = {
    loss: {
        title: "Weight Loss Plan",
        desc: "High protein, lower carbs to keep you full while in a deficit.",
        meals: [
            { name: "Breakfast", food: "Oatmeal with protein powder & berries", portion: "1/2 cup oats, 1 scoop protein" },
            { name: "Lunch", food: "Grilled Chicken Salad", portion: "150g Chicken, Big bowl greens, Light dressing" },
            { name: "Snack", food: "Greek Yogurt or Apple", portion: "1 cup yogurt or 1 medium apple" },
            { name: "Dinner", food: "Lean Fish/Tofu with Steamed Veggies", portion: "150g Protein, 2 cups veggies" }
        ]
    },
    maintain: {
        title: "Maintenance Plan",
        desc: "Balanced macros to keep your energy high and weight stable.",
        meals: [
            { name: "Breakfast", food: "Eggs on Toast with Avocado", portion: "2 Eggs, 2 slices whole grain toast, 1/4 avocado" },
            { name: "Lunch", food: "Turkey Sandwich & Fruit", portion: "Whole grain bread, 150g turkey, lettuce/tomato" },
            { name: "Snack", food: "Handful of Almonds & Cheese Stick", portion: "30g nuts, 1 cheese stick" },
            { name: "Dinner", food: "Pasta with Meat Sauce/Lentils", portion: "1.5 cups pasta, tomato sauce, lean beef/lentils" }
        ]
    },
    gain: {
        title: "Muscle Gain Plan",
        desc: "High calorie, protein-rich meals to fuel muscle growth.",
        meals: [
            { name: "Breakfast", food: "Big Omelet with Cheese & Toast", portion: "3 Eggs, Cheese, 2 slices toast, 1 banana" },
            { name: "Lunch", food: "Chicken Rice Bowl", portion: "200g Chicken, 1.5 cups rice, veggies, avocado" },
            { name: "Snack", food: "Protein Shake + Peanut Butter Toast", portion: "1 scoop protein, 2 tbsp PB on toast" },
            { name: "Dinner", food: "Steak/Salmon with Potatoes", portion: "200g meat, large potato, veggies" }
        ]
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Check URL params for goal
    const urlParams = new URLSearchParams(window.location.search);
    const goal = urlParams.get('goal') || 'maintain';
    
    // Set dropdown value
    const select = document.getElementById('goal-select');
    if(select) {
        select.value = goal;
        renderPlan(goal);
    }
});

function renderPlan(goal) {
    const data = DIET_DATA[goal];
    if (!data) return;

    const container = document.getElementById('diet-container');
    container.innerHTML = ''; // Clear current

    // Render Meals
    data.meals.forEach(meal => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <h3 style="color: var(--primary-color)">${meal.name}</h3>
            <p><strong>${meal.food}</strong></p>
            <p style="color: var(--light-text); font-size: 0.9rem;">${meal.portion}</p>
        `;
        container.appendChild(div);
    });

    document.getElementById('plan-description').textContent = data.desc;
}
