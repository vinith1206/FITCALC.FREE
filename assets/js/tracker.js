/**
 * Local Weight Tracker Logic
 */

let weightData = [];
let weightChart;

document.addEventListener('DOMContentLoaded', () => {
    // Set default date to today
    const dateInput = document.getElementById('track-date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }

    // Load data
    const saved = localStorage.getItem('fitCalcWeightData');
    if (saved) {
        weightData = JSON.parse(saved);
        // Sort by date
        weightData.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    if (document.getElementById('tracker-form')) {
        document.getElementById('tracker-form').addEventListener('submit', addEntry);
        renderChart();
    }
});

function addEntry(e) {
    e.preventDefault();
    
    const date = document.getElementById('track-date').value;
    const weight = parseFloat(document.getElementById('track-weight').value);

    // Check if entry for date exists
    const existingIndex = weightData.findIndex(entry => entry.date === date);
    
    if (existingIndex >= 0) {
        if(confirm("Overwrite entry for this date?")) {
            weightData[existingIndex].weight = weight;
        } else {
            return;
        }
    } else {
        weightData.push({ date, weight });
    }

    // Save
    localStorage.setItem('fitCalcWeightData', JSON.stringify(weightData));

    // Sort again
    weightData.sort((a, b) => new Date(a.date) - new Date(b.date));

    renderChart();
    
    // Feedback
    alert("Saved!");
}

function clearData() {
    if(confirm("Are you sure you want to delete all history?")) {
        localStorage.removeItem('fitCalcWeightData');
        weightData = [];
        renderChart();
    }
}

function renderChart() {
    const ctx = document.getElementById('weightChart');
    if (!ctx) return;

    if (weightData.length === 0) {
        document.getElementById('weightChart').style.display = 'none';
        document.getElementById('no-data-msg').style.display = 'block';
        return;
    }

    document.getElementById('weightChart').style.display = 'block';
    document.getElementById('no-data-msg').style.display = 'none';

    // Destroy prev instance if exists
    if (weightChart) {
        weightChart.destroy();
    }

    const labels = weightData.map(d => d.date);
    const dataPoints = weightData.map(d => d.weight);

    // Chart.js config
    weightChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Weight (kg)',
                data: dataPoints,
                borderColor: '#00F0FF',
                backgroundColor: 'rgba(0, 240, 255, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true,
                pointBackgroundColor: '#7000FF'
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    ticks: { color: '#94A3B8' },
                    grid: { color: 'rgba(255,255,255,0.05)' }
                },
                y: {
                    ticks: { color: '#94A3B8' },
                    grid: { color: 'rgba(255,255,255,0.05)' }
                }
            },
            plugins: {
                legend: {
                    labels: { color: '#FFF' }
                }
            }
        }
    });
}
