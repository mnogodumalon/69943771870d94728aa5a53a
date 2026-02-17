# Design Brief: Gewohnheitstracker

## 1. App Analysis

### What This App Does
Gewohnheitstracker is a habit tracking application that helps users build and maintain daily habits. Users define habits (Gewohnheiten) with categories and target frequencies, then track their daily completion through daily entries (Tägliche Einträge). The app also supports daily journals (Tagesprotokoll) for reflection.

### Who Uses This
People who want to build better routines - fitness enthusiasts tracking workouts, professionals building productivity habits, or anyone wanting to establish consistent daily practices. They're motivated but need accountability and visual progress to stay on track.

### The ONE Thing Users Care About Most
**"How am I doing today?"** - Users want to instantly see their daily habit completion status: which habits they've done, which are still pending, and their overall streak/consistency. The daily completion rate is the heartbeat of this app.

### Primary Actions (IMPORTANT!)
1. **Mark habit as done** → Primary Action Button (quick toggle for today)
2. **Add daily entry** → Log a habit completion with optional notes/value
3. **Add new habit** → Create a new habit to track
4. **Add daily journal** → Write reflection notes

---

## 2. What Makes This Design Distinctive

### Visual Identity
A calm, focused design with a warm neutral base and a vibrant coral accent. The warmth conveys positivity and accomplishment, while the clean layout reduces overwhelm. The design feels like a mindful productivity app - encouraging without being aggressive, celebrating progress without guilt-tripping failures.

### Layout Strategy
- **Hero element**: Today's completion ring dominates the top - a large circular progress indicator showing X of Y habits completed today
- **Asymmetric layout**: Hero takes ~40% of mobile viewport, creating clear visual hierarchy
- **Size variation**: The completion ring is dramatically larger than habit cards below
- **Typography creates hierarchy**: Large 48px completion number, medium 18px habit names, small 14px metadata
- **Grouping**: Habits grouped by completion status (pending first, then completed) with visual separation

### Unique Element
The **circular progress ring** around today's completion percentage uses a thick 10px stroke with rounded caps and a subtle drop shadow. When complete (100%), it pulses once with a gentle glow animation. This gamifies daily completion without being childish.

---

## 3. Theme & Colors

### Font
- **Family:** Plus Jakarta Sans
- **URL:** `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap`
- **Why this font:** Clean, modern sans-serif with excellent readability at all sizes. Has personality without being distracting. The rounded terminals feel approachable and friendly, matching the encouraging nature of a habit tracker.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(30 25% 98%)` | `--background` |
| Main text | `hsl(30 10% 15%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(30 10% 15%)` | `--card-foreground` |
| Borders | `hsl(30 15% 90%)` | `--border` |
| Primary action | `hsl(12 76% 61%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(158 64% 42%)` | `--accent` |
| Muted background | `hsl(30 15% 95%)` | `--muted` |
| Muted text | `hsl(30 10% 45%)` | `--muted-foreground` |
| Success/positive | `hsl(158 64% 42%)` | (component use) |
| Error/negative | `hsl(0 72% 51%)` | `--destructive` |

### Why These Colors
- **Warm cream background** (hsl 30 25% 98%): Creates a cozy, paper-like feel that's easier on the eyes than pure white
- **Coral primary** (hsl 12 76% 61%): Energetic and motivating without being aggressive like red. Stands out beautifully against the warm neutral base
- **Teal accent** (hsl 158 64% 42%): Used for success/completion states. Provides satisfying contrast and a "green = good" association without using generic green

### Background Treatment
Solid warm cream background (hsl 30 25% 98%). The warmth comes from the subtle orange undertone, creating a cozy feeling without visible texture or gradient. Cards are pure white to "lift" above the background.

---

## 4. Mobile Layout (Phone)

### Layout Approach
The hero (today's completion ring) dominates the first viewport fold, immediately answering "How am I doing today?". Below, habits are presented as tappable cards in a single column, sorted with pending habits first to create natural task flow.

### What Users See (Top to Bottom)

**Header:**
- Left: "Gewohnheiten" as page title (24px, weight 600)
- Right: Settings icon (gear) - subtle, muted color

**Hero Section (The FIRST thing users see):**
- Large circular progress ring (200px diameter) centered
- Inside the ring: completion fraction "3/5" in large text (48px bold)
- Below ring: "Heute erledigt" label (14px, muted)
- Below label: Current streak badge "7 Tage Streak" if applicable (small pill badge with flame icon)
- Takes approximately 45% of viewport height
- The ring uses the accent color (teal) for completed portion, muted color for remaining
- **Why this is the hero**: Users open the app to check "How am I doing today?" - this answers it instantly

**Section 2: Heute (Today's Habits)**
- Section header: "Heute" with count badge (e.g., "5 Gewohnheiten")
- List of habit cards, single column
- Each card shows:
  - Left: Checkbox (circular, 24px)
  - Middle: Habit name (16px, weight 500), category below (12px, muted)
  - Right: If measurable, show current value
- Pending habits shown first (unchecked), completed habits below (checked, slightly muted)
- Tapping checkbox toggles completion
- Tapping card opens detail view

**Section 3: Diese Woche (Weekly Overview)**
- Compact 7-day grid showing completion dots
- Each day: small circle, filled if all habits done, half-filled if partial, empty if none
- Current day highlighted with ring
- Shows at-a-glance weekly consistency

**Bottom Navigation / Action:**
- Fixed bottom bar with primary action: "+" FAB (floating action button) in coral
- Tapping FAB opens quick-add menu: "Eintrag hinzufügen", "Neue Gewohnheit"

### Mobile-Specific Adaptations
- Hero section is vertical (ring above text)
- Habit cards are full-width, stacked vertically
- Weekly grid is compact (7 circles in a row)
- Bottom FAB provides quick access to primary actions

### Touch Targets
- Checkboxes: 44x44px touch target minimum
- Habit cards: full width, 64px minimum height
- FAB: 56px diameter

### Interactive Elements
- Tapping a habit card opens a slide-up sheet with full details, edit/delete options
- Long-press on habit card shows quick actions (edit, delete)

---

## 5. Desktop Layout

### Overall Structure
Two-column layout (60/40 split):
- **Left column (60%)**: Hero + Today's habits (main content)
- **Right column (40%)**: Weekly chart, habit list management, journal

Eye flow: Hero ring (top-left) → Today's habits (below hero) → Weekly chart (right) → Habit management (right, below)

### Section Layout

**Top Area:**
- Header spans full width: "Gewohnheitstracker" title left, user actions right (add button)

**Left Column (Main):**
- Hero: Completion ring (240px) with stats, positioned top
- Below hero: Today's habits as a list/grid, 2 columns if space allows
- Each habit card larger than mobile (more details visible)

**Right Column (Supporting):**
- Weekly completion chart (bar chart, 7 days)
- "Alle Gewohnheiten" section: List of all habits with edit/delete
- "Tagesprotokoll" section: Today's journal entry or prompt to add

### What Appears on Hover
- Habit cards: Subtle shadow increase, edit/delete icons appear
- Checkboxes: Scale up slightly (1.1x)
- Chart bars: Tooltip with exact completion count

### Clickable/Interactive Areas
- Habit cards → Open edit dialog
- Chart bars → Could filter to show that day's entries (optional enhancement)
- Journal section → Click to add/edit today's journal

---

## 6. Components

### Hero KPI
The MOST important metric that users see first.

- **Title:** Heute erledigt
- **Data source:** Tägliche Einträge (filtered to today) + Gewohnheiten (total count)
- **Calculation:** Count of today's entries where erledigt=true, divided by total active habits
- **Display:** Large circular progress ring (200px mobile, 240px desktop) with fraction inside (e.g., "3/5")
- **Context shown:** Current streak displayed below as badge, calculated from consecutive days with 100% completion
- **Why this is the hero:** Immediately answers "How am I doing today?" which is the core user question

### Secondary KPIs

**Streak (Tage in Folge)**
- Source: Tägliche Einträge
- Calculation: Count consecutive days (backwards from today) with 100% completion
- Format: number + "Tage"
- Display: Badge with flame icon, shown below hero ring

**This Week Completion**
- Source: Tägliche Einträge (last 7 days)
- Calculation: Average daily completion rate
- Format: percent
- Display: Shown in weekly chart header

**Total Habits**
- Source: Gewohnheiten
- Calculation: Count
- Format: number
- Display: Badge in section header

### Chart
- **Type:** Bar chart - simple and clear for comparing daily completion across the week
- **Title:** Diese Woche
- **What question it answers:** "Am I being consistent?" - shows daily completion pattern
- **Data source:** Tägliche Einträge, grouped by day
- **X-axis:** Days of week (Mo, Di, Mi, Do, Fr, Sa, So)
- **Y-axis:** Completion count (0 to max habits)
- **Mobile simplification:** Compact dot grid instead of full bar chart (each day is a dot: filled/half/empty)

### Lists/Tables

**Heute (Today's Habits)**
- Purpose: Show what needs to be done today, allow quick completion
- Source: Gewohnheiten (all active habits) + Tägliche Einträge (today)
- Fields shown: Habit name, category, checkbox, optional value if measurable
- Mobile style: Card list, single column
- Desktop style: Card grid, 2 columns
- Sort: Pending first, then completed
- Limit: All (no limit)

**Alle Gewohnheiten (All Habits)**
- Purpose: Manage habit definitions
- Source: Gewohnheiten
- Fields shown: Name, category, frequency, start date
- Mobile style: Accessed via sheet/modal
- Desktop style: List in right sidebar
- Sort: By name
- Limit: All

**Tagesprotokoll (Daily Journal)**
- Purpose: Reflection and notes for the day
- Source: Tagesprotokoll
- Fields shown: Date, notes, linked completed habits
- Mobile style: Expandable section
- Desktop style: Card in right column
- Sort: By date (most recent first)
- Limit: Today's entry only in dashboard, full list in modal

### Primary Action Button (REQUIRED!)

- **Label:** Eintrag hinzufügen
- **Action:** add_record
- **Target app:** Tägliche Einträge
- **What data:** gewohnheit (select from list), datum (auto-today), erledigt (checkbox), menge (optional number), notizen (optional text)
- **Mobile position:** FAB (floating action button) bottom-right
- **Desktop position:** Header area + inline on habit cards
- **Why this action:** The core action is logging habit completion. Users do this multiple times daily.

### CRUD Operations Per App (REQUIRED!)

**Gewohnheiten (Habits) CRUD Operations**

- **Create (Erstellen):**
  - **Trigger:** "Neue Gewohnheit" button in header or FAB menu
  - **Form fields:**
    - gewohnheit_name (text, required)
    - beschreibung (textarea)
    - kategorie (select: Gesundheit & Fitness, Ernährung, Produktivität, Persönliche Entwicklung, Soziales, Finanzen, Sonstiges)
    - ziel_haeufigkeit (select: Täglich, Mehrmals pro Woche, Wöchentlich, Monatlich)
    - startdatum (date, default: today)
    - zielwert (text, optional - e.g., "30 Minuten", "2 Liter")
    - messbar (checkbox - "Mit Mengen/Zahlen tracken")
  - **Form style:** Dialog/Modal
  - **Required fields:** gewohnheit_name
  - **Default values:** startdatum = today, ziel_haeufigkeit = "taeglich"

- **Read (Anzeigen):**
  - **List view:** Cards in "Alle Gewohnheiten" section showing name, category badge, frequency
  - **Detail view:** Click card → Dialog showing all fields
  - **Fields shown in list:** Name, category, frequency icon
  - **Fields shown in detail:** All fields
  - **Sort:** Alphabetically by name
  - **Filter/Search:** Filter by category (optional)

- **Update (Bearbeiten):**
  - **Trigger:** Click edit icon (pencil) on habit card, or click card and then "Bearbeiten" button
  - **Edit style:** Same dialog as Create, pre-filled with current values
  - **Editable fields:** All fields

- **Delete (Löschen):**
  - **Trigger:** Click delete icon (trash) on habit card, or in detail dialog
  - **Confirmation:** AlertDialog with warning
  - **Confirmation text:** "Möchtest du die Gewohnheit '{name}' wirklich löschen? Alle zugehörigen Einträge bleiben erhalten."

**Tägliche Einträge (Daily Entries) CRUD Operations**

- **Create (Erstellen):**
  - **Trigger:**
    - Click checkbox on habit card (quick create with erledigt=true)
    - Click FAB → "Eintrag hinzufügen"
    - Click "+" on individual habit card
  - **Form fields:**
    - gewohnheit (select from Gewohnheiten, required)
    - datum (date, default: today)
    - erledigt (checkbox, default: true)
    - menge (number, shown only if habit is messbar)
    - notizen (textarea)
  - **Form style:** Dialog/Modal (or inline quick-create for checkbox toggle)
  - **Required fields:** gewohnheit, datum
  - **Default values:** datum = today, erledigt = true

- **Read (Anzeigen):**
  - **List view:** Shown as completion state on habit cards (checkbox checked/unchecked)
  - **Detail view:** Click habit card → shows today's entry if exists, with all fields
  - **Fields shown in list:** Completion status (checkbox), value if messbar
  - **Fields shown in detail:** All fields including notes
  - **Sort:** By datum (newest first)
  - **Filter/Search:** By date (default: today), by habit

- **Update (Bearbeiten):**
  - **Trigger:** Click on completed habit to edit the entry, or pencil icon in detail view
  - **Edit style:** Same dialog as Create, pre-filled
  - **Editable fields:** erledigt, menge, notizen (gewohnheit and datum usually fixed)

- **Delete (Löschen):**
  - **Trigger:** Uncheck checkbox (for erledigt toggle) or delete icon in detail view
  - **Confirmation:** Only for full delete, not for unchecking
  - **Confirmation text:** "Möchtest du diesen Eintrag wirklich löschen?"

**Tagesprotokoll (Daily Journal) CRUD Operations**

- **Create (Erstellen):**
  - **Trigger:** "Notiz hinzufügen" button in Tagesprotokoll section
  - **Form fields:**
    - protokoll_datum (date, default: today)
    - erledigte_gewohnheiten (select from Gewohnheiten, optional - to highlight key accomplishments)
    - tagesnotizen (textarea, required)
  - **Form style:** Dialog/Modal
  - **Required fields:** protokoll_datum, tagesnotizen
  - **Default values:** protokoll_datum = today

- **Read (Anzeigen):**
  - **List view:** Card showing date and truncated notes preview
  - **Detail view:** Click card → full notes in dialog
  - **Fields shown in list:** Date, first 100 chars of notes
  - **Fields shown in detail:** All fields
  - **Sort:** By date (newest first)
  - **Filter/Search:** By date range

- **Update (Bearbeiten):**
  - **Trigger:** Click edit icon on journal card, or click card and then "Bearbeiten"
  - **Edit style:** Same dialog as Create, pre-filled
  - **Editable fields:** All fields

- **Delete (Löschen):**
  - **Trigger:** Delete icon on journal card or in detail view
  - **Confirmation:** AlertDialog
  - **Confirmation text:** "Möchtest du den Tageseintrag vom {datum} wirklich löschen?"

---

## 7. Visual Details

### Border Radius
- Cards: rounded (12px) - `rounded-xl`
- Buttons: rounded (8px) - `rounded-lg`
- Badges: pill (9999px) - `rounded-full`
- Inputs: rounded (8px) - `rounded-lg`
- Progress ring: full circle

### Shadows
- Cards: subtle shadow - `shadow-sm` at rest, `shadow-md` on hover
- FAB: elevated shadow - `shadow-lg`
- Dialogs: elevated shadow - `shadow-xl`

### Spacing
- Normal to spacious - generous padding creates calm feel
- Card padding: 16px mobile, 20px desktop
- Section gaps: 24px mobile, 32px desktop
- Inner element gaps: 12px

### Animations
- **Page load:** Stagger fade-in for cards (100ms delay between each)
- **Hover effects:** Cards lift slightly (translateY -2px), shadow increases
- **Tap feedback:** Scale down to 0.98 on tap, spring back
- **Progress ring:** Animates from 0 to current value on load (600ms ease-out)
- **Checkbox toggle:** Satisfying check animation with slight bounce

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
:root {
  --background: hsl(30 25% 98%);
  --foreground: hsl(30 10% 15%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(30 10% 15%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(30 10% 15%);
  --primary: hsl(12 76% 61%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(30 15% 95%);
  --secondary-foreground: hsl(30 10% 25%);
  --muted: hsl(30 15% 95%);
  --muted-foreground: hsl(30 10% 45%);
  --accent: hsl(158 64% 42%);
  --accent-foreground: hsl(0 0% 100%);
  --destructive: hsl(0 72% 51%);
  --border: hsl(30 15% 90%);
  --input: hsl(30 15% 90%);
  --ring: hsl(12 76% 61%);
  --radius: 0.75rem;
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from URL above (Plus Jakarta Sans)
- [ ] All CSS variables copied exactly
- [ ] Mobile layout matches Section 4
- [ ] Desktop layout matches Section 5
- [ ] Hero element (completion ring) is prominent as described
- [ ] Colors create the warm, encouraging mood described in Section 2
- [ ] CRUD patterns are consistent across all apps
- [ ] Delete confirmations are in place
- [ ] Progress ring animates on load
- [ ] Checkboxes have satisfying toggle interaction
- [ ] FAB positioned correctly on mobile
- [ ] Weekly overview displays correctly
- [ ] All three apps have full CRUD (Gewohnheiten, Tägliche Einträge, Tagesprotokoll)
