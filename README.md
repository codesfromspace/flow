# Flow

Local-first cognitive tracking dashboard for logging medication doses, focus, mood, sleep pressure, hydration context, and daily activation trends.

## What It Does

- Stores all logs locally in IndexedDB.
- Models medication activation deterministically from dose time, dose amount, onset, peak, half-life, duration, and medication strength.
- Lets doses be logged for now, 15 minutes ago, 30 minutes ago, or a custom time.
- Supports custom medication profiles from the settings modal.
- Provides reorderable dashboard widgets with persisted widget order.
- Exports local logs as Markdown.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3001`.

## Build

```bash
npm run build
```

The project should live in a path without a literal backslash character. A directory named `claude\ code` can break Node/Next module resolution because package paths become invalid encoded `file://` URLs.

## Data And Privacy

Flow is local-first. It does not sync data to an external service. Clearing browser storage or deleting IndexedDB data removes the app's stored logs and settings.

## Medical Disclaimer

This app is for personal tracking and estimation only. It is not medical advice, diagnosis, or dosage guidance. Medication timing, dose changes, side effects, and treatment decisions should be handled with a qualified clinician.
