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
- Progress is persisted locally using AsyncStorage (daily progress, theme preference, extra word sessions, word confidence levels)
- The dictionary is embedded client-side with 60+ words across categories (greetings, numbers, family, nature)
- **Confidence Scoring**: Each word can have a confidence level (learning/familiar/mastered) that persists across sessions
- **Dictionary Management**: Users can add, edit, and delete words via the EditWord screen. Changes persist in AsyncStorage (userAddedWords, editedWords, deletedWordIds)
- **Dictionary Bundles**: Optional vocabulary packs that ship with app updates. Users can preview, accept, or dismiss bundles from Settings → Dictionary Updates. Bundle words use IDs >= 100000 to avoid collisions with base dictionary (1-999) and user-added words (1000-99999). Bundle state tracked via AsyncStorage (word_bundle_applied, word_bundle_dismissed)

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
- **@react-native-async-storage/async-storage**: Local data persistence for progress and preferences

### Development Environment
- Replit-specific environment variables: `REPLIT_DEV_DOMAIN`, `REPLIT_DOMAINS`, `EXPO_PUBLIC_DOMAIN`
- CORS configuration supports both Replit domains and localhost for Expo web development