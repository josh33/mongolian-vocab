# Mongolian Vocabulary Practice App

## Overview

A mobile-first language learning application designed for English speakers learning Mongolian vocabulary. The app provides daily flashcard practice with two modes (English→Mongolian and Mongolian→English), a searchable dictionary, and user-customizable themes. Built with Expo/React Native for cross-platform mobile support and a Node.js/Express backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Expo SDK 54 with React Native 0.81
- **Navigation**: React Navigation v7 with bottom tabs and native stack navigator
- **State Management**: React Context (`AppContext`) for global app state combined with TanStack React Query for server state
- **Styling**: StyleSheet-based with a centralized theme system supporting light/dark modes
- **Animations**: React Native Reanimated for smooth card flip animations and UI interactions
- **Fonts**: Google Fonts (Lora for headings, Inter for body text) loaded via Expo Font

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **API Structure**: RESTful endpoints prefixed with `/api`
- **Database**: PostgreSQL with Drizzle ORM for type-safe queries
- **Schema Validation**: Zod with drizzle-zod integration for runtime validation

### Data Flow
- Daily vocabulary words are selected deterministically based on the current date using a seeded shuffle algorithm
- **Local Storage Architecture (Platform-Aware)**:
  - **Native (iOS/Android)**: Uses SQLite via expo-sqlite for reliable persistence across app updates and reinstalls
  - **Web**: Uses AsyncStorage (SQLite has limited WebAssembly support on web)
  - Key files: `client/lib/database.ts` (SQLite schema/operations), `client/lib/storage.ts` (platform-aware API)
  - Automatic migration: On native platforms, existing AsyncStorage data is migrated to SQLite on first launch
- The dictionary is embedded client-side with 60+ words across categories (greetings, numbers, family, nature)
- **Confidence Scoring**: Each word can have a confidence level (learning/familiar/mastered) that persists across sessions
- **Dictionary Management**: Users can add, edit, and delete words via the EditWord screen. Changes persist in AsyncStorage (userAddedWords, editedWords, deletedWordIds)
- **Dictionary Packs (Versioned)**: Vocabulary packs with version support, delivered via OTA updates. Located in `client/data/packs/`. Features:
  - Pack manifest (`manifest.ts`) defines available packs with id, version, title, description, wordCount
  - Pack words use IDs >= 200000 to avoid collisions with base dictionary (1-999), user-added (1000-99999), and legacy bundles (100000+)
  - Users can preview, accept, or dismiss packs from Settings → Dictionary Updates
  - Version tracking enables pack upgrades when new versions ship via OTA
  - Accepted packs stored in AsyncStorage (`accepted_packs` key with array of {id, version})
  - Dismissed packs stored separately with version to re-show when upgraded
- **OTA Updates**: Automatic over-the-air updates via expo-updates. Configured in app.json with:
  - `checkAutomatically: "ON_LOAD"` - checks on app launch
  - `fallbackToCacheTimeout: 0` - loads immediately, applies update on next launch
  - `runtimeVersion.policy: "appVersion"` - OTA only for same native version
  - App also checks for updates when returning to foreground (via AppState listener)
  - Logic in `client/lib/otaUpdates.ts`
- **Streak System**: Chess.com-inspired daily streak tracking with Mongolian horse icon. Users must practice 5 words/day minimum to maintain streaks. Features:
  - Streak badge in Today screen header (tappable to view details)
  - StreakScreen modal with current streak, weekly calendar, and streak freeze status
  - Weekly streak freeze: allows recovery by practicing 10 words the next day (resets each Sunday)
  - Streak celebration on CompletionScreen when streak is incremented
  - History stored in SQLite (native) or AsyncStorage (web) with date-based tracking

### Key Design Patterns
- **Path Aliases**: `@/` maps to `./client`, `@shared/` maps to `./shared`
- **Screen-based Organization**: Each screen is self-contained in `client/screens/`
- **Separation of Concerns**: Navigation logic in `client/navigation/`, reusable UI in `client/components/`
- **Theme System**: Colors, spacing, typography, and shadows defined in `client/constants/theme.ts`

### Build System
- Development: Expo development server with Metro bundler
- Production: Custom build script for static web builds, esbuild for server bundling
- TypeScript throughout with strict mode enabled

## External Dependencies

### Core Services
- **PostgreSQL Database**: Used for user data persistence (configured via `DATABASE_URL` environment variable)
- **Drizzle ORM**: Database migrations stored in `./migrations` directory

### Third-Party Libraries
- **expo-haptics**: Tactile feedback for card interactions
- **expo-blur**: iOS-style blur effects for navigation bars
- **expo-splash-screen**: Controlled splash screen display during font loading
- **expo-updates**: Over-the-air updates for EAS-built binaries
- **expo-sqlite**: SQLite database for reliable local persistence on native platforms (iOS/Android)
- **@react-native-async-storage/async-storage**: Local data persistence for web platform and legacy fallback

### Development Environment
- Replit-specific environment variables: `REPLIT_DEV_DOMAIN`, `REPLIT_DOMAINS`, `EXPO_PUBLIC_DOMAIN`
- CORS configuration supports both Replit domains and localhost for Expo web development