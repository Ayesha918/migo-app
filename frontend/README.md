# MiGo – Frontend

**MiGo** is an AI-powered literacy assistant designed for neo-literates, older adults, and first-time smartphone users. This is the React frontend for Milestone 1, covering Registration, Login, Dashboard, and the Reading/Writing/Comprehension Assessment framework.

---

## Tech Stack

- **React.js** (Vite)
- **React Router DOM** – client-side routing
- **Axios** – API calls to the Django backend
- **Framer Motion** – animations and transitions
- **react-speech-recognition** – voice input (speech-to-text)
- **Web Speech API** – voice output (text-to-speech), native browser API, no extra package
- **CSS Modules** – scoped component styling

---

## Prerequisites

- Node.js (LTS recommended)
- The MiGo Django backend running locally at `http://127.0.0.1:8000` (see backend README)

---

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

The app will start on Vite's dev server (typically `http://localhost:5173`, but check your terminal — Vite auto-shifts the port if 5173 is already in use).

> **Note:** If the port changes, make sure the new port is added to `CORS_ALLOWED_ORIGINS` in the backend's `config/settings.py`, or API calls will fail with a CORS/connection error.

---

## ⚠️ Important: Testing Voice Features

Voice input and output **only work in a real standalone browser** (Chrome or Edge) — **not** in VS Code's built-in Simple Browser tab. That embedded webview does not properly support microphone access or the Web Speech API. Always open the app's URL in an actual Chrome/Edge window for testing anything mic- or speaker-related.

---

## Project Structure

```
frontend/src/
├── components/
│   ├── Landing/                 → Welcome screen (mascot, tagline, 2 CTAs)
│   │
│   ├── Register/                → 4-step registration wizard
│   │   ├── Register.jsx             → Owns form state + step navigation
│   │   ├── StepName.jsx             → Name input (typing + voice)
│   │   ├── StepAge.jsx              → Age input (typing + voice)
│   │   ├── StepLanguage.jsx         → Language dropdown (en/hi/kn/ta)
│   │   ├── StepAvatar.jsx           → Avatar grid selector
│   │   ├── ProgressBar.jsx          → Step progress indicator
│   │   ├── RegistrationSuccess.jsx  → Displays generated Learner ID
│   │
│   ├── Login/                   → "I Already Joined" — search by Learner ID or name
│   │
│   ├── Dashboard/                → Post-login home: profile, assessment cards,
│   │                                progress card, recent activity
│   │
│   └── Assessment/
│       ├── Assessment.jsx              → Router — reads :type from URL, renders
│       │                                  the matching assessment component
│       ├── ReadingAssessment.jsx       → Word/picture multiple-choice flow
│       ├── ComprehensionAssessment.jsx → Passage + multiple-choice flow
│       ├── WritingAssessment.jsx       → Free-text prompt (typing + voice)
│       └── AssessmentResult.jsx        → Shared score + encouragement screen
│
├── services/                    → Non-UI logic, reused across components
│   ├── api.js                       → All axios calls (single source of API URLs)
│   ├── LearnerContext.jsx           → Global learner session (React Context +
│   │                                  localStorage persistence across refreshes)
│   ├── translations.js              → UI text dictionary (en/hi/kn/ta)
│   ├── useTranslate.js              → Hook: t('key') → translated string,
│   │                                  bound to the logged-in learner's language
│   ├── useVoiceInput.js             → Wraps react-speech-recognition (mic input)
│   └── speak.js                     → Wraps window.speechSynthesis (voice output,
│                                       auto-picks a female voice where available)
│
├── App.jsx                      → Route definitions
├── main.jsx                     → Entry point — wraps app in BrowserRouter +
│                                   LearnerProvider
└── index.css                    → Minimal global reset
```

---

## Routing Map

| Route | Component | Notes |
|---|---|---|
| `/` | `Landing` | Entry point |
| `/register` | `Register` | 4-step wizard → success screen |
| `/login` | `Login` | Search by Learner ID or name |
| `/dashboard` | `Dashboard` | Requires an active learner session |
| `/assessment/:type` | `Assessment` | `:type` = `reading` \| `writing` \| `comprehension` |

---

## Key Concepts

### Learner Session (`LearnerContext.jsx`)
There is no password-based auth. Once a learner registers or logs in, their record is stored in a React Context **and mirrored to `localStorage`**, so refreshing the page doesn't lose the session. Any component can access the current learner via:

```javascript
import { useLearner } from '../../services/LearnerContext';
const { learner, setLearner, logout } = useLearner();
```

### Multilingual UI (`translations.js` + `useTranslate.js`)
All UI copy is looked up by key, in the learner's `preferred_language` (`en`, `hi`, `kn`, `ta`), with automatic fallback to English if a key or language is missing:

```javascript
import useTranslate from '../../services/useTranslate';
const t = useTranslate();
t('welcome'); // → "Welcome" / "स्वागत है" / "ಸ್ವಾಗತ" / "வரவேற்கிறோம்"
```

Assessment *content* (passages, questions, prompts) is multilingual too, but that content lives on the backend and is fetched pre-translated based on the learner's language — `translations.js` only covers UI chrome, not assessment content.

### Voice Input (`useVoiceInput.js`)
A reusable hook wrapping `react-speech-recognition`. Fires a callback once listening stops, with the final recognized transcript — avoids partial-word jitter while the user is still speaking.

### Voice Output (`speak.js`)
A single `speak(text, langCode)` function wrapping the native `SpeechSynthesis` API. Cancels any in-progress speech before starting new speech (prevents overlapping voices from repeated taps), and prefers a female-sounding voice when the browser has one available for that language.

---

## Environment / Backend Dependency

This frontend expects the Django backend to be running at `http://127.0.0.1:8000/api`. The base URL is configured in `src/services/api.js`:

```javascript
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});
```

Update this if your backend runs on a different host/port.