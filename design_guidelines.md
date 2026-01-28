# Mongolian Vocabulary Practice App - Design Guidelines

## Brand Identity

**Purpose**: A focused learning tool for English speakers beginning their Mongolian language journey. The app replaces overwhelming textbooks with a daily, achievable practice ritual.

**Aesthetic Direction**: **Editorial/Cultural Reverence**
- Inspired by Mongolian textiles and traditional scroll paintings
- Deep, rich colors that feel studious but not clinical
- Generous whitespace to reduce cognitive load during learning
- Typography hierarchy that guides the eye like a well-designed language textbook
- Cultural authenticity without kitsch—subtle nods to Mongolian design through color and pattern, not stereotypes

**Memorable Element**: The card flip animation mimics the physical ritual of flipping flashcards, combined with a subtle Mongolian textile pattern revealed on the answer side of each card.

## Navigation Architecture

**Root Navigation**: Tab Bar (3 tabs)
1. **Today** (practice icon) - Daily flashcard practice
2. **Dictionary** (book icon) - Browse full word list
3. **Settings** (gear icon) - Theme toggle, app preferences

## Screen-by-Screen Specifications

### 1. Today Screen (Home)
**Purpose**: Daily practice hub showing completion status and access to both modes

**Layout**:
- Header: Transparent, large title "Today's Practice"
- Main content: Scrollable
- Top safe area inset: headerHeight + Spacing.xl
- Bottom safe area inset: tabBarHeight + Spacing.xl

**Components**:
- Date display (subtle, top of content)
- Two large practice mode cards:
  - "English → Mongolian" card with completion checkmark when done
  - "Mongolian → English" card with completion checkmark when done
  - Each shows progress (e.g., "3/5 completed")
- Celebration illustration when BOTH modes completed
- "Get 5 New Words" button (secondary style, below practice cards)

**Empty State**: N/A (daily words always available)

### 2. Flashcard Practice Screen (Modal)
**Purpose**: Interactive flashcard interface for learning words

**Layout**:
- Header: Non-transparent with close button (left), mode title (center)
- Main content: Fixed, non-scrollable
- Top safe area inset: Spacing.xl
- Bottom safe area inset: insets.bottom + Spacing.xl

**Components**:
- Progress dots (5 dots, filled/unfilled) below header
- Large centered flashcard with:
  - Front: Question word + language label
  - Back: Answer word + pronunciation in parentheses + subtle textile pattern background
  - Tap anywhere to flip animation
- "Next" button (floating at bottom, disabled until card flipped)
- Haptic feedback on flip and progress advance

### 3. Completion Screen (Modal)
**Purpose**: Celebrate finishing a practice mode

**Layout**:
- Full-screen modal
- Main content: Centered vertically

**Components**:
- Celebration illustration (success-mongolian.png)
- Headline: "Mode Complete!" 
- Subtext: Encouragement message
- "Continue" button to return to Today screen
- If BOTH modes done: Different illustration (both-complete.png) and "All Done for Today!" headline

### 4. Dictionary Screen
**Purpose**: Browse and search all available words

**Layout**:
- Header: Non-transparent with search bar
- Main content: Scrollable list
- Top safe area inset: Spacing.xl (search in header)
- Bottom safe area inset: tabBarHeight + Spacing.xl

**Components**:
- Search bar in header
- Alphabetically sorted list of word pairs
- Each row: English (bold) | Mongolian + (pronunciation)
- Tap row to see full card view (modal)

**Empty State**: "No words found" with illustration (empty-search.png) when search returns no results

### 5. Settings Screen
**Purpose**: App preferences and theme control

**Layout**:
- Header: Default navigation header with "Settings" title
- Main content: Scrollable form
- Top safe area inset: Spacing.xl
- Bottom safe area inset: tabBarHeight + Spacing.xl

**Components**:
- Theme toggle: "Dark Mode" switch
- About section with app version
- No user account (local-only app)

## Color Palette

**Primary**: Deep Sapphire Blue (#1B3A6B) - Main brand color, headers, active states
**Secondary**: Mongolian Gold (#D4AF37) - Accents, progress indicators, success states
**Background Light**: Warm Parchment (#FAF8F3) - Light mode background
**Background Dark**: Deep Indigo (#0F1828) - Dark mode background
**Surface Light**: White (#FFFFFF) - Cards in light mode
**Surface Dark**: Slate Blue (#1E2A3A) - Cards in dark mode
**Text Primary Light**: Charcoal (#2C3E50)
**Text Primary Dark**: Soft White (#F5F5F5)
**Text Secondary**: Muted Gray (#6B7280)
**Success**: Jade Green (#059669)
**Pattern Accent**: Terracotta (#C1664F) - Subtle textile pattern on card backs

## Typography

**Primary Font**: **Lora** (Google Font) - Elegant serif for Mongolian text and headers, evokes printed educational materials
**Secondary Font**: **Inter** (Google Font) - Clean sans-serif for English text and UI elements

**Type Scale**:
- Display (Lora Bold, 32pt) - Screen titles
- Headline (Lora Bold, 24pt) - Card front word
- Body Large (Inter Regular, 18pt) - Card pronunciation
- Body (Inter Regular, 16pt) - List items, descriptions
- Caption (Inter Regular, 14pt) - Labels, secondary info

## Visual Design

**Icons**: Feather icons from @expo/vector-icons (consistent, minimal)

**Card Flip Animation**:
- 3D perspective flip on Y-axis
- Duration: 400ms ease-in-out
- Back of card reveals subtle Mongolian textile pattern (diagonal lines in Pattern Accent color at 5% opacity)

**Progress Dots**:
- Filled: Mongolian Gold
- Unfilled: 20% opacity of current text color
- Size: 12pt diameter, Spacing.md apart

**Buttons**:
- Primary: Deep Sapphire Blue background, white text, rounded corners (12pt radius)
- Secondary: Transparent background, Primary color border, Primary color text
- Floating "Next" button: Primary style with subtle shadow:
  - shadowOffset: {width: 0, height: 2}
  - shadowOpacity: 0.10
  - shadowRadius: 2

**Touchable Feedback**: All touchables reduce opacity to 0.7 when pressed

## Assets to Generate

**App Icon** (icon.png)
- Mongolian-inspired design with deep blue background and gold stylized letter/pattern
- WHERE USED: Device home screen

**Splash Icon** (splash-icon.png)
- Simplified version of app icon
- WHERE USED: App launch screen

**Success Illustration** (success-mongolian.png)
- Celebrates completing one practice mode
- Style: Simple, flat illustration with Mongolian yurt or cultural element in gold/blue palette
- WHERE USED: Completion screen when one mode is done

**Both Complete Illustration** (both-complete.png)
- Celebrates finishing both modes for the day
- Style: More elaborate than success-mongolian.png, shows two elements (representing both modes)
- WHERE USED: Completion screen when both modes complete

**Empty Search Illustration** (empty-search.png)
- Shows magnifying glass or book with no results
- Style: Subtle, minimal, supportive
- WHERE USED: Dictionary screen when search returns no results

All illustrations should use the app's color palette (Deep Sapphire Blue, Mongolian Gold, Terracotta) and feel hand-drawn/artisanal to match the cultural reverence theme.