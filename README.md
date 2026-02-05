# Mongolian Vocab

**Mongolian Vocab** is a simple, offline-first iOS app for learning and practicing Mongolian–English vocabulary.

The app is intentionally minimal: no accounts, no tracking, no ads. All vocabulary and learning progress are stored locally on the device.

---

## Features

- 📖 Built-in Mongolian ↔ English dictionary (base list + optional packs + custom words)
- 🧠 Daily vocabulary practice (two modes: English → Mongolian, Mongolian → English)
- ✍️ Add, edit, or delete custom words
- 📊 Track confidence per word (learning / familiar / mastered)
- 🧊 Streaks with weekly streak freeze mechanic
- 🌙 Light and dark mode support
- 🔒 Fully offline — no network required (optional OTA updates for new packs)

---

## Privacy

Mongolian Vocab does **not** collect or transmit any personal data.

- No user accounts
- No analytics or tracking
- No external APIs
- All data is stored locally on the device

Privacy policy:  
https://josh33.com/mongolian-vocab/privacy.html

---

## Tech Stack

- **Expo (Managed Workflow)**
- **React Native**
- **TypeScript**
- **expo-sqlite** for local persistence on native platforms
- **AsyncStorage** fallback on web
- **EAS Build + TestFlight** for iOS distribution
- **GitHub Actions** for CI builds and OTA publishing

## Storage & Data

This app is fully offline. All data lives on-device.

- **Native (iOS/Android):** SQLite via `expo-sqlite`
- **Web:** AsyncStorage
- **Migration:** On first native launch, AsyncStorage data is migrated into SQLite automatically

### Dictionary Sources

- **Base dictionary:** embedded in the app bundle
- **Packs:** versioned vocabulary packs that can be added from the Dictionary Updates screen
- **Custom words:** created by the user

## Dictionary Packs & OTA Updates

- Packs are versioned and can be previewed, added, dismissed, or upgraded.
- OTA updates (via `expo-updates`) deliver new pack data when enabled.
- The “Auto-download New Packs” toggle controls OTA update checks.

## Dictionary Size

The base dictionary contains ~900 words, and grows when you add packs or custom entries.

## Backend

There is no backend API for the vocabulary app. The server in this repo is used only for static web builds and Expo manifest routing.

---

## Development

### Prerequisites

- Node.js (18+ recommended)
- npm
- Expo CLI

### Install dependencies

```bash
npm install
```

### Run locally with Expo

```bash
npx expo start
```

Use Expo Go on a physical device or an iOS simulator.

---

## Builds & Distribution

iOS builds are handled via **Expo Application Services (EAS)**.

- Preview builds run automatically on pushes to `main`
- Production builds + TestFlight submission run on version tags (e.g. `v1.0.2`)
- CI is configured using GitHub Actions

---

## Status

This project is actively developed and currently distributed via TestFlight.

Feedback from testers is welcome.

---

## License

MIT License © Joshua Albrechtsen
