/**
 * BMI Calculator Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("BMI Script Loaded");
    const form = document.getElementById('bmi-form');
    if (form) {
        console.log("BMI Form Found");
        form.addEventListener('submit', calculateBMI);
    } else {
        console.error("BMI Form Not Found");
    }
});

function calculateBMI(e) {
    e.preventDefault();
    console.log("calculating BMI...");

    const heightInput = document.getElementById('bmi-height');
    const weightInput = document.getElementById('bmi-weight');
    const resultCard = document.getElementById('bmi-result-card');
    const scoreDisplay = document.getElementById('bmi-score');
    const categoryDisplay = document.getElementById('bmi-category');
    const messageDisplay = document.getElementById('bmi-message');

    if (!heightInput || !weightInput) {
        console.error("Inputs not found");
        return;
    }

    const heightCm = parseFloat(heightInput.value);
    const weightKg = parseFloat(weightInput.value);

    if (isNaN(heightCm) || isNaN(weightKg) || heightCm <= 0 || weightKg <= 0) {
        alert("Please enter valid positive numbers for height and weight.");
        return;
    }

    // BMI Formula: weight (kg) / (height (m) ^ 2)
    const heightM = heightCm / 100;
    const bmi = (weightKg / (heightM * heightM)).toFixed(1);
    
    console.log(`BMI Calculated: ${bmi}`);

    // Category Logic
    let category = '';
    let color = '';
    
    if (bmi < 18.5) {
        category = 'Underweight';
        color = 'var(--primary-color)'; 
    } else if (bmi < 24.9) {
        category = 'Normal Weight';
        color = 'var(--success-color)';
    } else if (bmi < 29.9) {
        category = 'Overweight';
        color = 'var(--warning-color)';
    } else {
        category = 'Obese';
        color = 'var(--danger-color)';
    }

    // Update UI
    if (scoreDisplay) scoreDisplay.textContent = bmi;
    if (categoryDisplay) {
        categoryDisplay.textContent = category;
        categoryDisplay.style.color = color;
    }
    if (messageDisplay) {
        messageDisplay.textContent = `A healthy BMI range is 18.5 to 24.9.`;
    }

    // Show Result
    if (resultCard) {
        resultCard.style.display = 'block';
        // Scroll to result for better UX on mobile
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}
