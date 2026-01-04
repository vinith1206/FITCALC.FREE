# FitCalc - Professional Fitness & Nutrition Suite

A modern, privacy-focused, and scientifically accurate fitness calculator suite designed for users to track their health metrics, calculate calories, and generate diet plans.

## 🚀 Features

### Core Calculators
- **Calorie Calculator**: Uses the Mifflin-St Jeor formula to estimate TDEE. Supports Goal settings (Loss/Gain/Maintain).
- **BMI Calculator**: Checks Body Mass Index with standard medical categories.
- **Water Intake**: Estimates daily hydration needs based on weight and activity.
- **Body Fat**: Estimates body fat percentage using the U.S. Navy Method (Tape Measure).
- **Ideal Weight**: Calculates healthy weight ranges using Devine, Robinson, Miller, and Hamwi formulas.
- **Macro Split**: Customizes macronutrient targets (Keto, Zone, High Protein, etc.).

### Pro Analytics
- **Weight Projections**: Estimates dates for reaching goal weight at different paces.
- **Zig-Zag Cycling**: Generates a 7-day calorie cycling schedule to prevent metabolic adaptation.
- **Weight Tracker**: Serverless, local-storage based progress tracking with interactive charts.

### Technical Highlights
- **Privacy First**: No data is sent to servers. All calculations and tracking happen in the browser (`localStorage`).
- **PWA Ready**: Installable on mobile devices (iOS/Android) as a full-screen app.
- **Responsive Design**: Glassmorphism UI that adapts to all screen sizes.
- **Dark Mode**: High-contrast, futuristic neon aesthetic.

## 🛠️ Stack
- **HTML5**: Semantic and SEO-optimized.
- **CSS3**: Variable-based, Flexbox/Grid layouts with glassmorphism effects.
- **JavaScript (Vanilla)**: Lightweight, fast execution without heavy frameworks.
- **Chart.js**: For visualizing weight progress.

## 📦 File Structure
- `index.html`: Landing page.
- `calculator.html`: Main tool.
- `assets/`: Contains `css`, `js`, and `images`.

## 🚀 How to Run
1. Simply open `index.html` in any web browser.
2. Or serve locally: `npx serve .`

## 📄 License
Free to use and modify.
