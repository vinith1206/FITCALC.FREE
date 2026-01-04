/**
 * Body Fat Calculator (US Navy Method)
 */

function toggleGenderFields() {
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const hipGroup = document.getElementById('hip-group');
    const hipInput = document.getElementById('bf-hip');
    
    if (gender === 'female') {
        hipGroup.style.display = 'block';
        hipInput.setAttribute('required', 'required');
    } else {
        hipGroup.style.display = 'none';
        hipInput.removeAttribute('required');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('bf-form');
    if (form) {
        form.addEventListener('submit', calculateBodyFat);
    }
});

function calculateBodyFat(e) {
    e.preventDefault();

    const gender = document.querySelector('input[name="gender"]:checked').value;
    const height = parseFloat(document.getElementById('bf-height').value);
    const neck = parseFloat(document.getElementById('bf-neck').value);
    const waist = parseFloat(document.getElementById('bf-waist').value);
    const hip = parseFloat(document.getElementById('bf-hip').value);

    let bodyFat = 0;

    // US Navy Formula (Metric)
    // Men: 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
    // Women: 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450

    if (gender === 'male') {
        bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
    } else {
        bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
    }

    bodyFat = bodyFat.toFixed(1);

    // Categories
    let category = '';
    // Simplistic ACE categories
    // Men: Essential 2-5%, Athletes 6-13%, Fitness 14-17%, Average 18-24%, Obese 25%+
    // Women: Essential 10-13%, Athletes 14-20%, Fitness 21-24%, Average 25-31%, Obese 32%+
    
    const bfVal = parseFloat(bodyFat);
    
    if (gender === 'male') {
        if (bfVal < 6) category = 'Essential Fat';
        else if (bfVal < 14) category = 'Athlete';
        else if (bfVal < 18) category = 'Fitness';
        else if (bfVal < 25) category = 'Average';
        else category = 'Obese';
    } else {
        if (bfVal < 14) category = 'Essential Fat';
        else if (bfVal < 21) category = 'Athlete';
        else if (bfVal < 25) category = 'Fitness';
        else if (bfVal < 32) category = 'Average';
        else category = 'Obese';
    }

    // Display
    document.getElementById('bf-result-card').style.display = 'block';
    document.getElementById('bf-value').textContent = bodyFat + '%';
    document.getElementById('bf-category').textContent = category;
}
