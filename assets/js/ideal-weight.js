/**
 * Ideal Weight Calculator Logic
 * Formulas: Robinson, Miller, Devine, Hamwi
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('ibw-form');
    if (form) {
        form.addEventListener('submit', calculateIBW);
    }
});

function calculateIBW(e) {
    e.preventDefault();

    const gender = document.querySelector('input[name="gender"]:checked').value;
    const heightCm = parseFloat(document.getElementById('height').value);

    if (!heightCm || heightCm <= 0) {
        alert("Please enter a valid height.");
        return;
    }

    // Convert Height to Feet and Inches over 5ft
    // 5ft = 152.4 cm
    const baseHeightCm = 152.4;
    
    // If shorter than 5ft, these formulas don't technically apply well, but we can clamp or extrapolate.
    // Standard practice for IBW formulas is they start at 5ft.
    
    let inchesOver5ft = 0;
    if (heightCm > baseHeightCm) {
        inchesOver5ft = (heightCm - baseHeightCm) / 2.54;
    } else {
        // Handle short stature logic? 
        // Usually: Subtract per inch under.
        // For simplicity: We'll calculate "per inch" diff.
         inchesOver5ft = (heightCm - baseHeightCm) / 2.54; // This will be negative
    }

    let robinson, miller, devine, hamwi;

    if (gender === 'male') {
        // Robinson: 52 kg + 1.9 kg per inch > 5ft
        robinson = 52 + (1.9 * inchesOver5ft);
        
        // Miller: 56.2 kg + 1.41 kg per inch > 5ft
        miller = 56.2 + (1.41 * inchesOver5ft);
        
        // Devine: 50 kg + 2.3 kg per inch > 5ft
        devine = 50 + (2.3 * inchesOver5ft);
        
        // Hamwi: 48 kg + 2.7 kg per inch > 5ft
        hamwi = 48 + (2.7 * inchesOver5ft);
        
    } else {
        // Female
        
        // Robinson: 49 kg + 1.7 kg per inch > 5ft
        robinson = 49 + (1.7 * inchesOver5ft);
        
        // Miller: 53.1 kg + 1.36 kg per inch > 5ft
        miller = 53.1 + (1.36 * inchesOver5ft);
        
        // Devine: 45.5 kg + 2.3 kg per inch > 5ft
        devine = 45.5 + (2.3 * inchesOver5ft);
        
        // Hamwi: 45.5 kg + 2.2 kg per inch > 5ft
        hamwi = 45.5 + (2.2 * inchesOver5ft);
    }

    // Update UI
    updateResult('robinson-val', robinson);
    updateResult('miller-val', miller);
    updateResult('devine-val', devine);
    updateResult('hamwi-val', hamwi);

    // Show result card
    const resultCard = document.getElementById('ibw-result-card');
    resultCard.style.display = 'block';
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function updateResult(id, kgValue) {
    const el = document.getElementById(id);
    if(el) {
        el.textContent = `${kgValue.toFixed(1)} kg`;
    }
}
