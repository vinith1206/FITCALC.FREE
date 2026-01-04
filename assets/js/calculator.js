/**
 * FitCalc Core Logic
 * Handles validation, BMR/TDEE calculation, and result rendering.
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('calorie-form');
    // If we are on the calculator page, attach listener
    if (form) {
        initCalculator();
        form.addEventListener('submit', handleCalculation);
    }
});

let currentUnit = 'metric'; // 'metric' or 'imperial'

function initCalculator() {
    // Inject Unit Toggle
    const formGroup = document.querySelector('.form-group'); // Inject before Age
    const toggleDiv = document.createElement('div');
    toggleDiv.className = 'form-group';
    toggleDiv.innerHTML = `
        <label>Units</label>
        <div class="radio-group" style="margin-bottom: 1rem;">
             <label class="radio-label">
                <input type="radio" name="unit" value="metric" checked onchange="toggleUnits('metric')"> Metric (cm/kg)
            </label>
            <label class="radio-label">
                <input type="radio" name="unit" value="imperial" onchange="toggleUnits('imperial')"> Imperial (ft/lbs)
            </label>
        </div>
    `;
    formGroup.parentNode.insertBefore(toggleDiv, formGroup);

    // Add Imperial Inputs (Hidden by default)
    // We will dynamically swap the inputs
}

window.toggleUnits = function (unit) {
    currentUnit = unit;
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    const goalWeightInput = document.getElementById('goal-weight');
    const heightLabel = document.querySelector('label[for="height"]');
    const weightLabel = document.querySelector('label[for="weight"]');
    const goalWeightLabel = document.querySelector('label[for="goal-weight"]');

    if (unit === 'imperial') {
        heightLabel.textContent = "Height (ft)";
        weightLabel.textContent = "Weight (lbs)";
        goalWeightLabel.textContent = "Goal Weight (lbs)";
        heightInput.placeholder = "e.g., 5.9 (5ft 9in)";
        weightInput.placeholder = "e.g., 160";
        goalWeightInput.placeholder = "e.g., 150";
    } else {
        heightLabel.textContent = "Height (cm)";
        weightLabel.textContent = "Weight (kg)";
        goalWeightLabel.textContent = "Goal Weight (kg)";
        heightInput.placeholder = "e.g., 175";
        weightInput.placeholder = "e.g., 70";
        goalWeightInput.placeholder = "e.g., 65";
    }
}

function handleCalculation(e) {
    e.preventDefault();

    // 1. Get Values
    const age = parseInt(document.getElementById('age').value);
    const gender = document.querySelector('input[name="gender"]:checked').value;
    let height = parseFloat(document.getElementById('height').value);
    let weight = parseFloat(document.getElementById('weight').value);
    const goalWeight = parseFloat(document.getElementById('goal-weight').value);
    const activity = parseFloat(document.getElementById('activity').value);
    const selectedGoal = document.getElementById('goal').value;

    // 2. Validate
    if (!age || !height || !weight || !goalWeight) {
        alert("Please fill in all fields including Goal Weight.");
        return;
    }

    // 3. Convert if Imperial
    if (currentUnit === 'imperial') {
        weight = weight / 2.20462;
        goalWeight = goalWeight / 2.20462;
        height = height * 30.48;
    }

    // 4. Calculate BMR (Mifflin-St Jeor) - uses Metric internally
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    if (gender === 'male') {
        bmr += 5;
    } else {
        bmr -= 161;
    }

    // 5. Calculate TDEE
    const tdee = Math.round(bmr * activity);

    // 6. Medical Safety Floors (USDA/Medical Guidelines)
    const MIN_CALORIES = (gender === 'male') ? 1500 : 1200;
    let hitSafetyFloor = false;

    const applySafetyFloor = (cals) => {
        if (cals < MIN_CALORIES) {
            hitSafetyFloor = true;
            return MIN_CALORIES;
        }
        return cals;
    };

    // 7. Calculate Goals & Dates
    const weightDiff = weight - goalWeight;
    const isLoss = weightDiff > 0;

    // Helper to get date
    const getDate = (weeks) => {
        if (weeks < 0) return "Reached";
        if (!isFinite(weeks)) return "Never";
        const d = new Date();
        d.setDate(d.getDate() + (weeks * 7));
        return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const results = {
        tdee: tdee,
        bmr: Math.round(bmr),
        weight: weight,
        goalWeight: goalWeight,
        gender: gender,
        selectedGoal: selectedGoal,
        type: isLoss ? 'loss' : 'gain',
        options: [],
        medicalWarning: false
    };

    if (isLoss) {
        // Loss Options with Safety Floor & Sustainability Cap (Max 35% deficit)
        const maxDeficit = tdee * 0.35;

        results.options = [
            { label: "Mild Weight Loss", pace: "0.25 kg/week", cals: applySafetyFloor(tdee - 250), date: getDate(weightDiff / 0.25) },
            { label: "Weight Loss", pace: "0.5 kg/week", cals: applySafetyFloor(tdee - 500), date: getDate(weightDiff / 0.5) },
            { label: "Extreme Weight Loss", pace: "1.0 kg/week", cals: applySafetyFloor(tdee - Math.min(1000, maxDeficit)), date: getDate(weightDiff / 1.0) }
        ];
        results.medicalWarning = hitSafetyFloor;
    } else {
        // Gain Options
        const gainDiff = goalWeight - weight;
        results.options = [
            { label: "Mild Weight Gain", pace: "0.25 kg/week", cals: tdee + 250, date: getDate(gainDiff / 0.25) },
            { label: "Weight Gain", pace: "0.5 kg/week", cals: tdee + 500, date: getDate(gainDiff / 0.5) },
            { label: "Fast Weight Gain", pace: "1.0 kg/week", cals: tdee + 1000, date: getDate(gainDiff / 1.0) }
        ];
    }

    // Zig-Zag Logic (Advanced User Personalization)

    // 1. Identify valid goal target
    // Check if 'loss' options exist (results.options are generated above)
    // We want to base the ZigZag on the "0.5kg/week" option if it's a loss goal.

    let baseTarget = tdee;

    if (results.type === 'loss' && results.options.length >= 2) {
        // Option index 1 is usually the standard 0.5kg/week loss
        baseTarget = results.options[1].cals;
    } else if (results.type === 'gain' && results.options.length >= 2) {
        baseTarget = results.options[1].cals;
    }

    // 2. Define High Days (Refeeds)
    // High Day = BaseTarget * 1.15
    // But for weight loss, strict capping at TDEE is safer to ensure deficit.

    let highDay = Math.round(baseTarget * 1.15);

    if (results.type === 'loss') {
        // Ensure High Day doesn't exceed Maintenance (TDEE) too much, 
        // effectively making it a "Maintenance Refeed" day.
        if (highDay > tdee) highDay = tdee;
    }

    // 3. Calculate Low Days to balance the week
    // Weekly Budget = BaseTarget * 7
    // Remaining Budget = Weekly Budget - (2 * HighDay)
    // Low Day = Remaining / 5

    let weeklyBudget = baseTarget * 7;
    let highAllocation = highDay * 2;
    let lowDay = Math.round((weeklyBudget - highAllocation) / 5);

    results.zigzag = {
        low: lowDay,
        high: highDay
    };

    // Save to localStorage
    localStorage.setItem('fitCalcResults', JSON.stringify(results));

    // 7. Redirect to Results
    window.location.href = 'results.html';
}

function loadResults() {
    const data = localStorage.getItem('fitCalcResults');
    if (!data) {
        // No data found, redirect back to calculator
        if (confirm("No calculation data found. Go to calculator?")) {
            window.location.href = 'calculator.html';
        }
        return;
    }

    const results = JSON.parse(data);

    // Standard Displays
    document.getElementById('tdee-display').textContent = results.tdee;

    const MIN_CALORIES = (results.gender === 'male') ? 1500 : 1200;
    const secureCals = (cals) => Math.max(cals, MIN_CALORIES);

    // Use specific values based on selected goal
    let primaryLossLabel = "Sustainable 0.5kg/week loss (-500 cal)";
    let primaryLossCals = secureCals(results.tdee - 500);
    let primaryGainLabel = "Build muscle (+300 cal)";
    let primaryGainCals = results.tdee + 300;

    if (results.selectedGoal === 'mildloss') {
        primaryLossLabel = "Mild weight loss 0.25kg/week (-250 cal)";
        primaryLossCals = secureCals(results.tdee - 250);
    } else if (results.selectedGoal === 'extremeloss') {
        primaryLossLabel = "Extreme weight loss 1kg/week (-1000 cal)";
        primaryLossCals = secureCals(results.tdee - 1000);
    } else if (results.selectedGoal === 'mildgain') {
        primaryGainLabel = "Mild weight gain 0.25kg/week (+250 cal)";
        primaryGainCals = results.tdee + 250;
    } else if (results.selectedGoal === 'gain') {
        primaryGainLabel = "Weight gain 0.5kg/week (+500 cal)";
        primaryGainCals = results.tdee + 500;
    } else if (results.selectedGoal === 'extremegain') {
        primaryGainLabel = "Extreme weight gain 1kg/week (+1000 cal)";
        primaryGainCals = results.tdee + 1000;
    }

    document.getElementById('loss-display').textContent = primaryLossCals.toLocaleString();
    const lossLabelEl = document.querySelector('.result-card.loss p');
    if (lossLabelEl) lossLabelEl.textContent = primaryLossLabel;

    document.getElementById('maintain-display').textContent = results.tdee.toLocaleString();

    document.getElementById('gain-display').textContent = primaryGainCals.toLocaleString();
    const gainLabelEl = document.querySelector('.result-card.gain p');
    if (gainLabelEl) gainLabelEl.textContent = primaryGainLabel;

    // Show Medical Disclaimer/Warning if needed
    if (results.medicalWarning || primaryLossCals === MIN_CALORIES) {
        const main = document.querySelector('main');
        const alertDiv = document.createElement('div');
        alertDiv.className = 'card';
        alertDiv.style.border = '1px solid var(--warning-color)';
        alertDiv.style.background = 'rgba(255, 184, 0, 0.1)';
        alertDiv.style.marginBottom = '2rem';
        alertDiv.innerHTML = `
            <h3 style="color: var(--warning-color); margin-bottom: 0.5rem;">⚠️ Health Safety Notice</h3>
            <p style="font-size: 0.9rem;">To ensure your safety, we have capped your calorie suggestion to <strong>${MIN_CALORIES} kcal</strong>. Consuming fewer calories than this is generally not recommended by doctors without direct medical supervision, as it may lead to nutrient deficiencies and fatigue.</p>
        `;
        main.insertBefore(alertDiv, main.firstChild);
    }
    // Display Maintenance Calories
    const mCard = document.querySelector('.result-card.maintain');
    if (mCard) {
        mCard.querySelector('.sub-number').innerText = Math.round(results.tdee) + ' cal';
    }

    // New Charts & PDF Logic
    renderMacroChart(results.tdee);
    renderMacroBars(results.tdee);

    // Render Projection Table (Visual Rows)
    const projContainer = document.querySelector('.table-container');
    if (projContainer && results.options && results.options.length > 0) {
        const maintainCals = results.tdee;
        let displayOptions = [...results.options];
        if (results.type === 'loss') {
            displayOptions.unshift({ label: "Maintain weight", pace: "0 kg/week", cals: maintainCals, date: "-" });
        }

        projContainer.innerHTML = displayOptions.map(opt => {
            const pct = Math.round((opt.cals / maintainCals) * 100);
            let valueClass = 'result-value';
            if (opt.cals < maintainCals) valueClass += ' highlight-loss';
            if (opt.cals === maintainCals) valueClass += ' maintain-value';

            let floorMarker = "";
            if (opt.cals === MIN_CALORIES && opt.label.includes("Loss")) {
                floorMarker = '<span style="display:block; font-size:0.7rem; color:var(--warning-color)">[HEALTH FLOOR]</span>';
            }

            return `
                <div class="result-row">
                    <div class="result-label">
                        <h3>${opt.label}</h3>
                        <p>${opt.pace}</p>
                    </div>
                    <div class="${valueClass}">
                        <h2>${opt.cals.toLocaleString()} <span style="font-size: 0.8em; opacity: 0.8">${pct}%</span></h2>
                        <p>Calories/day ${floorMarker}</p>
                    </div>
                </div>`;
        }).join('');
    }

    // Render Zig-Zag Table
    const zigzagTable = document.querySelector('#zigzag-table tbody');
    if (zigzagTable && results.zigzag) {
        const schedule = [
            { day: 'Monday', type: 'Low', cals: results.zigzag.low },
            { day: 'Tuesday', type: 'Low', cals: results.zigzag.low },
            { day: 'Wednesday', type: 'High', cals: results.zigzag.high },
            { day: 'Thursday', type: 'Low', cals: results.zigzag.low },
            { day: 'Friday', type: 'Low', cals: results.zigzag.low },
            { day: 'Saturday', type: 'Low', cals: results.zigzag.low },
            { day: 'Sunday', type: 'High', cals: results.zigzag.high },
        ];
        zigzagTable.innerHTML = schedule.map(day => `
            <tr>
                <td>${day.day}</td>
                <td style="font-weight:bold">${day.cals}</td>
                <td><span style="color: ${day.type === 'High' ? 'var(--warning-color)' : 'var(--text-color)'}">${day.type}</span></td>
            </tr>`).join('');
    }
}

function renderMacroChart(tdee) {
    const ctx = document.getElementById('macroChart');
    if (!ctx) return;
    const protein = Math.round((tdee * 0.30) / 4);
    const carbs = Math.round((tdee * 0.40) / 4);
    const fats = Math.round((tdee * 0.30) / 9);
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Protein', 'Carbs', 'Fats'],
            datasets: [{
                data: [protein * 4, carbs * 4, fats * 9],
                backgroundColor: ['#00F0FF', '#FFB800', '#00FF94'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            cutout: '70%',
            plugins: {
                legend: { position: 'bottom', labels: { color: '#FFF', padding: 20 } }
            }
        }
    });
}

function renderMacroBars(tdee) {
    const container = document.getElementById('macro-bars-container');
    if (!container) return;
    const p = Math.round((tdee * 0.30) / 4);
    const c = Math.round((tdee * 0.40) / 4);
    const f = Math.round((tdee * 0.30) / 9);
    container.innerHTML = `
        <div class="macro-item">
            <div class="macro-label"><span>🥩 Protein</span> <span>${p}g</span></div>
            <div class="progress-bar"><div class="progress-fill fill-protein" style="width: 30%"></div></div>
        </div>
        <div class="macro-item">
            <div class="macro-label"><span>🍞 Carbs</span> <span>${c}g</span></div>
            <div class="progress-bar"><div class="progress-fill fill-carbs" style="width: 40%"></div></div>
        </div>
        <div class="macro-item">
            <div class="macro-label"><span>🥑 Fats</span> <span>${f}g</span></div>
            <div class="progress-bar"><div class="progress-fill fill-fats" style="width: 30%"></div></div>
        </div>
    `;
}

function generatePDF() {
    const element = document.querySelector('main');
    const opt = {
        margin: 0.5,
        filename: 'FitCalc-Report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, backgroundColor: '#05050A' },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}

function viewDiet(goal) {
    // Redirect to diet plan page with query param
    window.location.href = `diet-plan.html?goal=${goal}`;
}
