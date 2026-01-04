/**
 * Water Intake Calculator Logic
 */

let currentWaterUnit = 'metric';

window.toggleWaterUnits = function(unit) {
    currentWaterUnit = unit;
    const weightInput = document.getElementById('water-weight');
    const weightLabel = document.querySelector('label[for="water-weight"]');

    if (unit === 'imperial') {
        weightLabel.textContent = "Weight (lbs)";
        weightInput.placeholder = "e.g., 160";
    } else {
        weightLabel.textContent = "Weight (kg)";
        weightInput.placeholder = "e.g., 70";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('water-form');
    if (form) {
        form.addEventListener('submit', calculateWater);
    }
});

function calculateWater(e) {
    e.preventDefault();

    let weight = parseFloat(document.getElementById('water-weight').value);
    const exerciseMins = parseFloat(document.getElementById('water-activity').value);

    if (!weight) return;

    // Convert to kg if imperial
    if (currentWaterUnit === 'imperial') {
        weight = weight / 2.20462;
    }

    // Base: 35ml per kg of body weight
    let waterMl = weight * 35;

    // Add for exercise: ~12ml per minute of exercise
    // (General rule: 12-20 oz per hour of exercise -> ~350-600ml / 60 mins -> ~6-10ml/min)
    // Let's go with a safe 10ml/min extra
    waterMl += (exerciseMins * 10);

    const liters = (waterMl / 1000).toFixed(2);
    const cups = (waterMl / 236).toFixed(1); // 236ml per cup

    // Display
    document.getElementById('water-result-card').style.display = 'block';
    document.getElementById('water-value').textContent = liters;
    
    // Additional text
    const unitText = document.querySelector('.sub-number');
    unitText.innerHTML = `Liters / day <br> <span style="font-size: 1rem; color: var(--text-muted)">approx. ${cups} cups</span>`;
}
