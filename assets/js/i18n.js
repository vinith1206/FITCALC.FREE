const translations = {
    en: {
        title: "FitCalc - Master Your Nutrition",
        nav_calories: "Calories",
        nav_tracker: "Tracker",
        nav_ai: "AI Diet Plan",
        hero_title: "Master Your Nutrition for Free",
        hero_subtitle: "Calculate your calories, discover your TDEE, check your BMI, and get a simple diet plan.",
        hero_cta_start: "START CALCULATOR",
        hero_cta_how: "HOW IT WORKS",
        features_title: "Why Use This Tool?",
        features_subtitle: "Everything you need to understand your nutrition, completely free",
        feature_1_title: "Scientific Accuracy",
        feature_1_text: "We use the Mifflin-St Jeor formula for calories and standard formulas for BMI.",
        feature_2_title: "Instant Results",
        feature_2_text: "Get your personalized nutrition plan in seconds. No waiting.",
        feature_3_title: "100% Free",
        feature_3_text: "No subscriptions, no sign-ups, no hidden fees. Always free.",
        sync_btn: "🔄 Sync from Tracker",
        generate_btn: "Generate Plan",
        calculate_btn: "Calculate My Calories",
        weight_lbl: "Weight (kg)",
        height_lbl: "Height (cm)",
        age_lbl: "Age",
        gender_lbl: "Gender",
        activity_lbl: "Activity Level",
        diet_lbl: "Diet Preference",
        goal_lbl: "Health Goal",
        download_pdf: "📥 Download PDF Report"
    },
    hi: {
        title: "FitCalc - आपका पोषण सहायक",
        nav_calories: "कैलोरी",
        nav_tracker: "ट्रैकर",
        nav_ai: "AI डाइट प्लान",
        hero_title: "अपने पोषण में महारत हासिल करें - बिल्कुल मुफ्त",
        hero_subtitle: "अपनी कैलोरी गिनें, अपना TDEE जानें, अपना BMI चेक करें और एक आसान डाइट प्लान पाएं।",
        hero_cta_start: "कैलकुलेटर शुरू करें",
        hero_cta_how: "यह कैसे काम करता है",
        features_title: "ये टूल क्यों चुनें?",
        features_subtitle: "आपके पोषण को समझने के लिए वो सब कुछ जो आपको चाहिए, बिल्कुल मुफ्त",
        feature_1_title: "वैज्ञानिक सटीकता",
        feature_1_text: "हम कैलोरी के लिए Mifflin-St Jeor और BMI के लिए मानक सूत्रों का उपयोग करते हैं।",
        feature_2_title: "तुरंत परिणाम",
        feature_2_text: "सेकंडों में अपना पर्सनल पोषण प्लान पाएं। कोई प्रतीक्षा नहीं।",
        feature_3_title: "100% मुफ्त",
        feature_3_text: "कोई सब्सक्रिप्शन नहीं, कोई साइन-अप नहीं, कोई छिपी हुई फीस नहीं। हमेशा मुफ्त।",
        sync_btn: "🔄 ट्रैकर से सिंक करें",
        generate_btn: "प्लान बनाएं",
        calculate_btn: "मेरी कैलोरी की गणना करें",
        weight_lbl: "वजन (किलो)",
        height_lbl: "लंबाई (सेमी)",
        age_lbl: "उम्र",
        gender_lbl: "लिंग",
        activity_lbl: "सक्रियता स्तर",
        diet_lbl: "आहार पसंद",
        goal_lbl: "स्वास्थ्य लक्ष्य",
        download_pdf: "📥 PDF रिपोर्ट डाउनलोड करें"
    }
};

let currentLang = localStorage.getItem('fitCalcLang') || 'en';

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('fitCalcLang', lang);
    updateStaticText();
    // Update language switcher appearance
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

function updateStaticText() {
    const t = translations[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (t[key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = t[key];
            } else {
                el.innerText = t[key];
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Inject Language Switcher if not present
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && !document.getElementById('lang-switcher')) {
        const li = document.createElement('li');
        li.id = 'lang-switcher';
        li.style.display = 'flex';
        li.style.gap = '10px';
        li.innerHTML = `
            <button class="lang-btn ${currentLang === 'en' ? 'active' : ''}" data-lang="en" onclick="setLanguage('en')" style="background:none; border:none; color:inherit; cursor:pointer; font-size:0.8rem;">EN</button>
            <button class="lang-btn ${currentLang === 'hi' ? 'active' : ''}" data-lang="hi" onclick="setLanguage('hi')" style="background:none; border:none; color:inherit; cursor:pointer; font-size:0.8rem;">HI</button>
        `;
        navLinks.appendChild(li);
    }
    updateStaticText();
});
