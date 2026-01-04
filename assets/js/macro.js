/**
 * Macro Calculator Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('macro-form');
    if (form) {
        form.addEventListener('submit', calculateMacros);
    }
});

function calculateMacros(e) {
    e.preventDefault();
    
    const cals = parseFloat(document.getElementById('macro-cals').value);
    const splitType = document.getElementById('macro-goal').value;

    if (!cals) {
        alert("Please enter calories.");
        return;
    }

    let p, c, f; // Percentages

    switch(splitType) {
        case 'keto':
            p = 0.25; c = 0.05; f = 0.70;
            break;
        case 'lowcarb':
            p = 0.40; c = 0.20; f = 0.40;
            break;
        case 'highpro':
            p = 0.45; c = 0.35; f = 0.20;
            break;
        case 'zone':
        case 'balanced':
        default:
            p = 0.30; c = 0.40; f = 0.30; // 30P/40C/30F
            break;
    }

    const proGrams = Math.round((cals * p) / 4);
    const carbGrams = Math.round((cals * c) / 4);
    const fatGrams = Math.round((cals * f) / 9);

    document.getElementById('pro-pct').textContent = `${(p*100)}%`;
    document.getElementById('pro-val').textContent = `${proGrams} g`;

    document.getElementById('carb-pct').textContent = `${(c*100)}%`;
    document.getElementById('carb-val').textContent = `${carbGrams} g`;

    document.getElementById('fat-pct').textContent = `${(f*100)}%`;
    document.getElementById('fat-val').textContent = `${fatGrams} g`;

    const card = document.getElementById('macro-result-card');
    card.style.display = 'block';
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
