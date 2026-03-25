# Nutri-Label Reader

A mobile-first, client-side nutrition label scanner designed for weight gain and calorie tracking.

## Features
- **Zero Wind-up:** Instant camera access upon launch.
- **Offline OCR:** Local text extraction using Tesseract.js (no data leaves your device).
- **High-Fidelity Parsing:** Specialized logic to capture Calories, Protein, Carbs, Total Fat (% DV), and Added Sugars.
- **Gallery Support:** Upload existing photos for analysis.
- **Interactive Cropping:** Isolate labels for maximum accuracy.

## Tech Stack
- Vue 3 + Vite
- Vuetify (Material Design)
- Tesseract.js (WASM)
- Vue-Cropper

## Setup
```bash
npm install
npm run dev
```
