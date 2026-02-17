# Design Brief: Gewohnheitstracker

## 1. App Analysis

### What This App Does
This is a habit tracking application (Gewohnheitstracker) that helps users build and maintain positive habits. Users define habits they want to cultivate (like exercise, meditation, reading), set frequency goals (daily, weekly, etc.), and track their daily progress. The app provides visibility into habit completion rates and helps maintain motivation through streak tracking.

### Who Uses This
German-speaking individuals focused on personal development and self-improvement. They want a simple, non-overwhelming way to track daily habits without complex goal-setting features. They value seeing their progress at a glance and appreciate gentle motivation rather than gamification.

### The ONE Thing Users Care About Most
**"Wie gut mache ich heute?"** (How well am I doing today?)

Users open this app primarily to:
1. See today's habits and which ones they've completed
2. Quickly mark habits as done
3. Get a sense of their overall consistency

The hero element must answer: "What's my completion rate for today?" with immediate visual feedback.

### Primary Actions (IMPORTANT!)
1. **Gewohnheit erledigen** (Mark habit as complete) → Primary Action - Inline toggles for each habit
2. **Täglichen Eintrag hinzufügen** (Add daily entry) → Secondary - For habits with quantity tracking
3. **Neue Gewohnheit erstellen** (Create new habit) → In Gewohnheiten section

---

## 2. What Makes This Design Distinctive

### Visual Identity
The design uses a warm, encouraging aesthetic that feels like a supportive companion rather than a demanding task manager. The soft sage green accent color evokes growth and nature, reinforcing the idea of "cultivating" habits like a garden. The cream-tinted background creates a calm, journal-like atmosphere that makes daily check-ins feel like a personal ritual rather than a chore.

### Layout Strategy
- **Hero is today's progress** - A large circular progress ring showing today's completion percentage dominates the top of the screen, making the answer to "How am I doing?" instantly visible
- **Asymmetric layout on desktop** - Left 2/3 shows today's habits in a spacious list, right 1/3 shows weekly trend and quick stats
- **Size variation creates hierarchy** - The progress ring is dramatically larger (180px on mobile, 240px on desktop) than other elements, secondary stats are compact inline badges
- **Breathing room** - Generous padding around the hero section creates focus, tighter spacing in the habit list creates efficient scanning

### Unique Element
**The habit completion cards use a satisfying "done" state transformation.** When a habit is marked complete, the card background shifts to a soft sage tint, a subtle checkmark appears, and the text styling changes to indicate completion. This micro-interaction makes checking off habits feel rewarding without being childish or over-animated.

---

## 3. Theme & Colors

### Font
- **Family:** Plus Jakarta Sans
- **URL:** `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap`
- **Why this font:** Plus Jakarta Sans has a friendly, modern character with slightly rounded terminals that feel approachable and warm. It's highly legible at both large hero sizes and small label text, and its weight range (400-700) provides excellent hierarchy options.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(45 30% 97%)` | `--background` |
| Main text | `hsl(200 15% 15%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(200 15% 15%)` | `--card-foreground` |
| Borders | `hsl(45 15% 88%)` | `--border` |
| Primary action (sage green) | `hsl(145 35% 42%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(145 40% 92%)` | `--accent` |
| Muted background | `hsl(45 20% 94%)` | `--muted` |
| Muted text | `hsl(200 10% 45%)` | `--muted-foreground` |
| Success/positive | `hsl(145 45% 45%)` | (component use) |
| Error/negative | `hsl(0 65% 50%)` | `--destructive` |

### Why These Colors
The warm cream background (`hsl(45 30% 97%)`) creates an inviting, paper-like quality that makes the app feel personal and journal-like. The sage green primary (`hsl(145 35% 42%)`) connects to themes of growth, health, and nature - perfect for a habit-building app. The color is distinctive (not generic teal or blue) while remaining calm and professional.

### Background Treatment
The background is a warm off-white with subtle cream undertones. No gradient or texture - the warmth comes purely from the hue shift. This creates a clean, modern feel while avoiding the clinical coldness of pure white.

---

## 4. Mobile Layout (Phone)

### Layout Approach
The mobile layout is a focused, single-column experience optimized for quick daily check-ins. The hero progress ring dominates the first viewport, immediately answering "How am I doing today?" The habit list below is designed for fast, one-handed interaction with large tap targets.

### What Users See (Top to Bottom)

**Header:**
- Left: App title "Gewohnheiten" in semi-bold (600 weight)
- Right: Settings icon (gear) for future settings access

**Hero Section (The FIRST thing users see):**
- **What:** Large circular progress ring showing today's completion percentage
- **Size:** Takes approximately 50% of first viewport height (ring diameter: 180px)
- **Center content:** Large percentage number (48px bold), label "Heute erledigt" below (14px muted)
- **Ring style:** 10px stroke, sage green for completed portion, light gray for remaining
- **Below ring:** Two compact stat badges side by side - "X von Y Gewohnheiten" and current streak "X Tage Streak"
- **Why hero:** This immediately answers the user's primary question and provides motivation

**Section 2: Heute's Gewohnheiten (Today's Habits)**
- Section header: "Heute" with date (e.g., "Dienstag, 17. Feb") in muted text
- List of habit cards, each showing:
  - Habit name (medium weight)
  - Category badge (small, colored pill)
  - Completion toggle (large checkbox on right, 44px tap target)
  - If measurable: small input for quantity
- Completed habits have sage-tinted background and muted text
- Cards have subtle shadow and 12px border radius

**Section 3: Diese Woche (Weekly Overview)**
- Compact 7-day grid showing completion dots for each day
- Each day: column with day abbreviation (Mo, Di, Mi...) and filled/empty circle
- Tapping a day could show that day's details (optional drill-down)

**Bottom Navigation / Action:**
- Floating Action Button (FAB) in bottom-right corner
- Sage green, "+" icon
- Opens bottom sheet to add new daily entry or habit

### Mobile-Specific Adaptations
- Habit cards are full-width with generous padding (16px)
- Checkbox toggle is on the right edge for easy thumb access
- Categories section hidden on mobile (accessible via FAB menu or settings)
- Weekly chart simplified to dot grid (no labels beyond day abbreviations)

### Touch Targets
- Habit completion checkboxes: minimum 44x44px
- FAB: 56px diameter
- Card tap areas: entire card is tappable for detail view

### Interactive Elements
- Tapping a habit card opens a detail sheet showing notes, history, and edit/delete options
- Long-press on habit could reveal quick actions (edit, delete)

---

## 5. Desktop Layout

### Overall Structure
Three-column layout with asymmetric proportions:
- **Left column (15%):** Navigation sidebar with category filters
- **Center column (55%):** Main content - hero and today's habits
- **Right column (30%):** Weekly stats, trends, and recent activity

Eye flow: Hero progress ring (center-top) → Today's habit list (center) → Weekly trend (right) → Categories (left for filtering)

### Section Layout

**Left Sidebar (fixed, 240px width):**
- App logo/title at top
- "Alle Gewohnheiten" link
- Category filters (Gesundheit, Ernährung, Produktivität, etc.)
- Active filter highlighted with sage accent
- "Neue Gewohnheit" button at bottom

**Center Main Area:**
- Hero section: Progress ring (240px diameter) with stats below
- Today's habits in a comfortable list with more horizontal space
- Each habit card shows: icon, name, category, streak, completion toggle
- Add entry inline button visible on hover

**Right Sidebar (320px width):**
- "Diese Woche" section with bar chart showing daily completions
- "Statistiken" section with key metrics:
  - Längster Streak (longest streak)
  - Durchschnittliche Erfüllung (average completion rate)
  - Aktivste Kategorie (most active category)
- "Letzte Aktivität" showing recent habit completions

### What Appears on Hover
- Habit cards: subtle shadow elevation, edit/delete icons appear on right
- Category pills: show "filter by this" tooltip
- Progress ring: show exact numbers (e.g., "4 von 6 Gewohnheiten")

### Clickable/Interactive Areas
- Habit cards → open detail dialog with full history and edit form
- Category pills → filter habits by category
- Weekly chart bars → show that day's habit breakdown
- "Alle Gewohnheiten" → navigate to habit management view

---

## 6. Components

### Hero KPI
The MOST important metric that users see first.

- **Title:** Heute erledigt
- **Data source:** Tägliche Einträge (filtered to today, erledigt=true) / Gewohnheiten (total active)
- **Calculation:** Count of today's completed entries / Count of daily habits × 100
- **Display:** Large circular progress ring with percentage in center
- **Context shown:** "X von Y Gewohnheiten" below the ring, current streak badge
- **Why this is the hero:** Immediately answers "How am I doing today?" - the user's primary question when opening the app

### Secondary KPIs

**Aktueller Streak**
- Source: Tägliche Einträge
- Calculation: Count consecutive days with 100% completion (or >80% as threshold)
- Format: number + "Tage"
- Display: Small badge next to hero

**Wochenfortschritt**
- Source: Tägliche Einträge (last 7 days)
- Calculation: Average daily completion rate
- Format: percentage
- Display: In right sidebar on desktop, below hero on mobile

**Aktive Gewohnheiten**
- Source: Gewohnheiten
- Calculation: Count of all habits
- Format: number
- Display: Compact stat in sidebar

### Chart (Weekly Overview)
- **Type:** Bar chart - shows daily progress as filled bars, making comparison easy
- **Title:** Diese Woche
- **What question it answers:** "Am I being consistent?" - shows pattern over time
- **Data source:** Tägliche Einträge (last 7 days, grouped by date)
- **X-axis:** Day of week (Mo, Di, Mi, Do, Fr, Sa, So)
- **Y-axis:** Completion percentage (0-100%)
- **Mobile simplification:** Replace bars with simple dot grid (filled = good day, empty = missed)

### Lists/Tables

**Heute's Gewohnheiten (Primary List)**
- Purpose: Show today's habits for quick completion tracking
- Source: Gewohnheiten (all) + Tägliche Einträge (today's entries)
- Fields shown: Habit name, category badge, completion status, optional quantity
- Mobile style: Full-width cards with prominent toggle
- Desktop style: Comfortable cards with hover actions
- Sort: Incomplete first, then by category
- Limit: All habits (typically 5-10)

**Alle Gewohnheiten (Management View)**
- Purpose: Full CRUD management of habits
- Source: Gewohnheiten
- Fields shown: Name, description, category, frequency, start date, goal
- Mobile style: Expandable cards
- Desktop style: Table with inline actions
- Sort: By category, then name
- Limit: All (paginate if >20)

### Primary Action Button (REQUIRED!)

- **Label:** "Eintrag hinzufügen" (mobile FAB shows just "+")
- **Action:** add_record
- **Target app:** Tägliche Einträge
- **What data:** Form with: Gewohnheit (select from Gewohnheiten), Datum (defaults to today), Erledigt (checkbox), Menge (optional number), Notizen (optional text)
- **Mobile position:** bottom_fixed (FAB in bottom-right)
- **Desktop position:** inline in habit card + header button
- **Why this action:** Users need to quickly log habit completions, especially for measurable habits where they enter a quantity

### CRUD Operations Per App (REQUIRED!)

**Gewohnheiten CRUD Operations**

- **Create (Erstellen):**
  - **Trigger:** "Neue Gewohnheit" button in sidebar (desktop) or FAB menu (mobile)
  - **Form fields:**
    - gewohnheit_name (text input, required)
    - beschreibung (textarea, optional)
    - kategorie (select: Gesundheit & Fitness, Ernährung, Produktivität, Persönliche Entwicklung, Soziales, Finanzen, Sonstiges)
    - ziel_haeufigkeit (select: Täglich, Mehrmals pro Woche, Wöchentlich, Monatlich)
    - startdatum (date picker, defaults to today)
    - zielwert (text input, optional - e.g., "30 Minuten" or "8 Gläser")
    - messbar (checkbox - "Mit Mengenangabe tracken")
  - **Form style:** Dialog/Modal
  - **Required fields:** gewohnheit_name
  - **Default values:** startdatum = today, kategorie = "sonstiges"

- **Read (Anzeigen):**
  - **List view:** Cards showing name, category badge, frequency badge
  - **Detail view:** Click card → Dialog showing all fields + completion history
  - **Fields shown in list:** gewohnheit_name, kategorie, ziel_haeufigkeit
  - **Fields shown in detail:** All fields + calculated stats (streak, completion rate)
  - **Sort:** By kategorie, then alphabetically
  - **Filter/Search:** Filter by kategorie, search by name

- **Update (Bearbeiten):**
  - **Trigger:** Edit icon (pencil) in card hover state or detail dialog
  - **Edit style:** Same dialog as Create but pre-filled
  - **Editable fields:** All fields

- **Delete (Löschen):**
  - **Trigger:** Delete icon (trash) in detail dialog or swipe left on mobile
  - **Confirmation:** AlertDialog with warning
  - **Confirmation text:** "Möchtest du die Gewohnheit '{name}' wirklich löschen? Alle zugehörigen Einträge bleiben erhalten."

**Tägliche Einträge CRUD Operations**

- **Create (Erstellen):**
  - **Trigger:** FAB button "+" or inline "Erledigt" toggle on habit card
  - **Form fields:**
    - gewohnheit (select from Gewohnheiten)
    - datum (date picker, defaults to today)
    - erledigt (checkbox, defaults to true)
    - menge (number input, only shown if habit.messbar=true)
    - notizen (textarea, optional)
  - **Form style:** Dialog for full form, inline toggle for quick completion
  - **Required fields:** gewohnheit, datum
  - **Default values:** datum = today, erledigt = true

- **Read (Anzeigen):**
  - **List view:** Integrated into habit cards (today's view) or calendar view (history)
  - **Detail view:** Click entry → Dialog with all fields
  - **Fields shown in list:** Habit name (via lookup), completion status, date
  - **Fields shown in detail:** All fields including menge and notizen
  - **Sort:** By datum (newest first)
  - **Filter/Search:** By date range, by gewohnheit

- **Update (Bearbeiten):**
  - **Trigger:** Click on entry in list or edit icon in detail view
  - **Edit style:** Same dialog as Create, pre-filled
  - **Editable fields:** All except gewohnheit (changing habit would be confusing)

- **Delete (Löschen):**
  - **Trigger:** Delete icon in detail dialog or swipe left on mobile
  - **Confirmation:** AlertDialog
  - **Confirmation text:** "Eintrag vom {datum} für '{gewohnheit_name}' löschen?"

**Tagesprotokoll CRUD Operations**

- **Create (Erstellen):**
  - **Trigger:** "Notiz hinzufügen" button in daily view or FAB menu
  - **Form fields:**
    - protokoll_datum (date picker, defaults to today)
    - tagesnotizen (textarea)
    - erledigte_gewohnheiten (multi-select from Gewohnheiten - optional summary)
  - **Form style:** Dialog/Modal
  - **Required fields:** protokoll_datum
  - **Default values:** protokoll_datum = today

- **Read (Anzeigen):**
  - **List view:** Shown below today's habits as "Tagesnotiz" card if exists
  - **Detail view:** Click to expand/edit
  - **Fields shown in list:** Date, first 100 chars of notes
  - **Fields shown in detail:** All fields
  - **Sort:** By protokoll_datum
  - **Filter/Search:** By date

- **Update (Bearbeiten):**
  - **Trigger:** Click on note card or edit icon
  - **Edit style:** Same dialog, pre-filled
  - **Editable fields:** All fields

- **Delete (Löschen):**
  - **Trigger:** Delete icon in expanded view
  - **Confirmation:** AlertDialog
  - **Confirmation text:** "Tagesnotiz vom {datum} löschen?"

---

## 7. Visual Details

### Border Radius
- **Cards:** 12px (rounded, friendly feel)
- **Buttons:** 8px (slightly less rounded)
- **Badges/Pills:** 9999px (full pill shape)
- **Inputs:** 8px

### Shadows
- **Cards at rest:** `0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)` (subtle)
- **Cards on hover:** `0 4px 12px rgba(0,0,0,0.08)` (elevated)
- **Dialogs:** `0 10px 40px rgba(0,0,0,0.12)` (prominent)
- **FAB:** `0 4px 12px rgba(0,0,0,0.15)` (floating)

### Spacing
- **Page padding:** 16px mobile, 24px desktop
- **Card padding:** 16px mobile, 20px desktop
- **Section gaps:** 24px mobile, 32px desktop
- **Hero section:** Extra top/bottom padding (32px mobile, 48px desktop)

### Animations
- **Page load:** Subtle fade-in (200ms) with slight upward slide (8px)
- **Hover effects:** 150ms ease-out for shadows and background changes
- **Tap feedback:** Slight scale down (0.98) on touch, spring back
- **Completion toggle:** Checkmark draws in with spring animation, card background fades to accent (200ms)
- **Progress ring:** Animated stroke on load (600ms ease-out)

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

:root {
  --background: hsl(45 30% 97%);
  --foreground: hsl(200 15% 15%);

  --card: hsl(0 0% 100%);
  --card-foreground: hsl(200 15% 15%);

  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(200 15% 15%);

  --primary: hsl(145 35% 42%);
  --primary-foreground: hsl(0 0% 100%);

  --secondary: hsl(45 20% 94%);
  --secondary-foreground: hsl(200 15% 25%);

  --muted: hsl(45 20% 94%);
  --muted-foreground: hsl(200 10% 45%);

  --accent: hsl(145 40% 92%);
  --accent-foreground: hsl(145 35% 25%);

  --destructive: hsl(0 65% 50%);
  --destructive-foreground: hsl(0 0% 100%);

  --border: hsl(45 15% 88%);
  --input: hsl(45 15% 88%);
  --ring: hsl(145 35% 42%);

  --radius: 0.75rem;

  --chart-1: hsl(145 35% 42%);
  --chart-2: hsl(145 45% 55%);
  --chart-3: hsl(45 60% 65%);
  --chart-4: hsl(200 30% 50%);
  --chart-5: hsl(320 40% 55%);
}

body {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from URL above (Plus Jakarta Sans)
- [ ] All CSS variables copied exactly
- [ ] Mobile layout matches Section 4 (hero ring, habit list, weekly dots)
- [ ] Desktop layout matches Section 5 (3-column with sidebar)
- [ ] Hero element is prominent as described (large progress ring)
- [ ] Colors create the mood described in Section 2 (warm, encouraging)
- [ ] CRUD patterns are consistent across all apps (same dialog style, button placement)
- [ ] Delete confirmations are in place for all delete operations
- [ ] Habit completion toggle works inline (quick interaction)
- [ ] FAB visible on mobile for quick entry
- [ ] Loading states with skeleton placeholders
- [ ] Empty states with encouraging messages
- [ ] Toast feedback on all CRUD operations
