# Flow

Personal dashboard for tracking medication doses, focus, mood, sleep, and daily energy — built to run entirely in your browser with no external services.

## Features

**Dose logging** — log a dose now, 15/30 minutes ago, or at a custom time. Flow models activation deterministically using onset, peak, half-life, and duration per medication.

**Dashboard widgets** — reorderable widgets for activation trends, hydration, mood, and more. Widget order persists between sessions.

**Custom medications** — define your own medication profiles (strength, timing parameters) from the settings modal.

**Local-first storage** — all data lives in IndexedDB in your browser. Nothing leaves your device. Export logs as Markdown at any time.

## Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:3001](http://localhost:3001).

```bash
npm run build   # production build
```

> **Note:** Keep the project in a path without backslashes. A directory named `claude\ code` can break Node/Next.js module resolution.

## Privacy

Flow does not sync or transmit data anywhere. Clearing browser storage or deleting IndexedDB data permanently removes all stored logs and settings.

## Medical Disclaimer

Flow is a personal tracking tool, not a medical device. Nothing in it constitutes medical advice, diagnosis, or dosage guidance. Consult a qualified clinician for any medication-related decisions.
