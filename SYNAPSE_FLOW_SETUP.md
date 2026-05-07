# Flow - Project Setup Complete ✨

Flow is a **cognitive state visualization system** for tracking psychostimulant effects, focus levels, and mental energy dynamics. It's designed to feel calm, scientific, and minimalist—like a personal operating system for cognition.

## ✅ What's Been Completed

### Foundation & Configuration
- [x] Next.js 14 project initialized with TypeScript
- [x] TailwindCSS configured with dark mode
- [x] Design tokens & CSS custom properties set up
- [x] Global styles with minimalist dark theme
- [x] PWA configuration (manifest.json, next-pwa)
- [x] IndexedDB setup for local-first persistence

### Core Architecture
- [x] Complete type system (CognitiveLog, MedicationProfile, etc.)
- [x] Pharmacokinetic curve calculations
- [x] Cognitive state algorithms (focus estimation, rebound risk, sleep pressure)
- [x] Mock data generator (1 week of realistic logs)
- [x] IndexedDB hooks & database operations

### Components Built
- [x] Header with real-time clock
- [x] Layout system
- [x] Current Cognitive State widget (with circular focus indicator)
- [x] Estimated Focus widget
- [x] Rebound Risk indicator
- [x] Sleep Pressure tracker
- [x] Mental Load visualizer
- [x] Hydration Reminder
- [x] Activation Curve chart (Recharts-based)
- [x] Daily Timeline visualization
- [x] Quick Log Form (multi-tab for dose/mood/focus)

### Key Features
- Local-first data persistence using IndexedDB
- Real-time cognitive state calculations
- Pharmacokinetic modeling for amphetamine, methylphenidate, caffeine
- Smooth curve animations
- Semi-transparent card design with glow effects
- Responsive grid layout

## 📁 Project Structure

```
flow/
├── app/
│   ├── layout.tsx              ✅ Root layout
│   ├── page.tsx                ✅ Dashboard (main page)
│   └── globals.css             ✅ Dark mode & styles
├── components/
│   ├── layout/
│   │   └── Header.tsx          ✅ Time & date display
│   ├── widgets/                ✅ All 6 widgets created
│   ├── charts/                 ✅ Recharts components
│   ├── core/                   ✅ Quick log form
│   └── ui/                     ⏳ shadcn/ui components (ready)
├── lib/
│   ├── store/
│   │   ├── db.ts               ✅ IndexedDB operations
│   │   └── schemas.ts          ⏳ Zod validation (optional)
│   ├── hooks/
│   │   └── useIndexedDB.ts     ✅ Custom hook
│   ├── utils/
│   │   ├── cognitive-math.ts   ✅ Pharmacokinetics & algorithms
│   │   └── mock-data.ts        ✅ Test data generator
│   └── constants/
│       └── medications.ts      ✅ Medication presets
├── types/
│   └── index.ts                ✅ TypeScript definitions
├── public/
│   └── manifest.json           ✅ PWA manifest
├── tailwind.config.ts          ✅ Custom colors & utilities
├── next.config.ts              ✅ PWA support
└── package.json                ✅ All dependencies installed

Legend: ✅ Complete | ⏳ Ready to use | ❌ Not started
```

## 🚀 Quick Start

### 1. Install & Run
```bash
cd "Documents/claude code/flow"
npm install  # Already done
npm run dev  # Start dev server on http://localhost:3001
```

### 2. Navigate to Dashboard
Open `http://localhost:3001` in your browser. The app will:
- Initialize IndexedDB
- Seed mock data (7 days of realistic logs)
- Display the full cognitive dashboard

### 3. Interact with the App
- **Quick Log Form**: Log doses, mood, or focus using the tabbed interface
- **Dashboard Widgets**: Watch real-time calculations of cognitive state
- **Timeline**: See medication events and mood check-ins for today
- **Activation Curve**: View the pharmacokinetic concentration over time

## 🧠 Core Algorithms

### Cognitive Activation Curve
The app calculates pharmacokinetic curves using absorption and elimination models:
```
concentration(t) = (dose * ka * ke) / (V * (ka - ke)) * (e^(-ke*t) - e^(-ka*t))
```

Where:
- **ka** = absorption rate constant (drug-specific)
- **ke** = elimination rate constant (based on half-life)
- **V** = volume of distribution

### Focus Estimation
Focus is calculated from concentration with an inverted-U curve (optimal at 0.75 concentration):
- Below optimal: linear increase (0.7 to 1.0 focus gain)
- Above optimal: Gaussian falloff (overstimulation penalty)

### Rebound Risk
Estimated based on remaining concentration:
- > 0.3 = No risk
- 0.15-0.3 = Low risk
- 0.05-0.15 = Medium risk
- < 0.05 = High risk (crash imminent)

## 🎨 Design System

### Colors (Dark Mode)
- **Background**: #0f172a (dark slate)
- **Cards**: #1e293b (semi-transparent)
- **Accent**: #22d3ee (cyan)
- **Status**: Green (#059669), Amber (#b45309), Red (#dc2626)

### Typography
- **Display**: 2.5rem, light weight
- **Headline**: 1.875rem, light weight
- **Title**: 1.25rem, medium weight
- **Body**: 0.875rem, regular weight

### Animations
- Fade-in: 300ms
- Smooth curves: 500ms transitions
- Hover effects: 200ms scale (1.02x)

## 📊 Medication Presets

Pre-configured profiles included:
| Drug | Onset | Peak | Duration | Half-Life |
|------|-------|------|----------|-----------|
| Amphetamine (IR) | 25 min | 150 min | 330 min | 11 hours |
| Methylphenidate (IR) | 20 min | 90 min | 180 min | 3 hours |
| Methylphenidate (XR) | 45 min | 240 min | 600 min | 6 hours |
| Caffeine | 20 min | 45 min | 300 min | 5.5 hours |

## 🔄 Data Flow

1. **User logs entry** → Add to IndexedDB
2. **Page calculates state** → Uses cognitive math utilities
3. **Update widgets** → Display real-time metrics
4. **Render visualizations** → Recharts components
5. **Persist locally** → All data stays on device

## 🛠 Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Format code
npm run lint
```

## 📦 Dependencies Installed

Core:
- `next` 16.2.4 - React framework
- `react` 19.2.4 - UI library
- `typescript` - Type safety

UI & Visualization:
- `recharts` - Smooth charts
- `tailwindcss` - Styling
- `framer-motion` - Animations (ready to use)

Storage & Data:
- `idb` - IndexedDB wrapper
- `uuid` - Unique IDs
- `zod` - Validation (ready)

PWA:
- `next-pwa` - Service worker

## 🎯 Next Steps (Optional Features)

### 1. Add shadcn/ui Components
If you want pre-built UI components:
```bash
npx shadcn@latest init
```

### 2. Add More Widgets
- Analysis page with trends
- Settings/medication management
- Data export (CSV/JSON)
- Calendar view

### 3. Enhance Analytics
- Daily/weekly/monthly trends
- Compare predicted vs. actual focus
- Overstimulation pattern detection
- Cumulative stimulant load analysis

### 4. Mobile Optimization
- Bottom sheet for quick logging
- Swipe gestures for navigation
- PWA home screen install

## ⚙️ Browser Support

The app works on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Any browser with IndexedDB support

## 🔒 Privacy & Security

- **All data is local**: Stored in IndexedDB, never sent anywhere
- **No accounts required**: Completely anonymous
- **Offline-first**: Works without internet
- **No tracking**: No analytics, no beacons

## 📝 File Reference

All the following files have been created and are ready to use:

### Config Files
- `types/index.ts` - All TypeScript interfaces
- `tailwind.config.ts` - Tailwind customization
- `next.config.ts` - Next.js + PWA config
- `app/layout.tsx` - Root layout
- `app/globals.css` - Global styles

### Database & Utils
- `lib/store/db.ts` - IndexedDB CRUD operations
- `lib/hooks/useIndexedDB.ts` - React hook for DB access
- `lib/utils/cognitive-math.ts` - Pharmacokinetic calculations
- `lib/utils/mock-data.ts` - Test data generator

### Components
- `components/layout/Header.tsx` - Time display
- `components/widgets/` - 6 widget components
- `components/charts/ActivationCurve.tsx` - Recharts curve
- `components/charts/DailyTimeline.tsx` - Timeline view
- `components/core/QuickLogForm.tsx` - Multi-tab logger

### Pages
- `app/page.tsx` - Dashboard (main page)
- `public/manifest.json` - PWA configuration

## 🎓 Learning Resources

### Pharmacokinetics
- Understanding drug absorption & elimination
- Half-life and concentration calculations
- Two-compartment kinetic models

### React/Next.js Patterns Used
- `'use client'` for client components
- `useEffect` for side effects
- Custom hooks for logic reuse
- TailwindCSS for styling

### IndexedDB
- Async storage API
- Object stores and indexes
- Version-based migrations

---

**Flow** is now ready to use! Start the dev server and explore your cognitive state visualization system. All data stays local to your device—you own your data completely.

Happy tracking! 🧠✨
