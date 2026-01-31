# Mongolian Vocab

**Mongolian Vocab** is a simple, offline-first iOS app for learning and practicing Mongolian–English vocabulary.

The app is intentionally minimal: no accounts, no tracking, no ads, and no backend services. All vocabulary and learning progress are stored locally on the device.

---

## Features

- 📖 Built-in Mongolian ↔ English dictionary
- 🧠 Daily vocabulary practice
- ✍️ Add, edit, or delete custom words
- 📊 Track confidence per word (learning / familiar / mastered)
- 🌙 Light and dark mode support
- 🔒 Fully offline — no network required

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
- **AsyncStorage** for local persistence
- **EAS Build + TestFlight** for iOS distribution
- **GitHub Actions** for CI builds

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
