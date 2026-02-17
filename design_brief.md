# Design Brief: Gewohnheitstracker

## 1. App Analysis

### What This App Does
This is a habit tracking system (Gewohnheitstracker) that helps users build and maintain daily habits. Users define habits they want to track, then log their progress daily. The system tracks completion status, optional quantities/values for measurable habits, and allows daily notes.

### Who Uses This
Someone who wants to improve their life through consistent habits - whether it's drinking more water, exercising, reading, or any personal goal. They're motivated but need accountability and visibility into their progress to stay on track.

### The ONE Thing Users Care About Most
**"Did I complete my habits today?"** - The streak, the daily completion rate, the feeling of checking off boxes. Users open this app to see their TODAY status at a glance and quickly log what they've done.

### Primary Actions (IMPORTANT!)
1. **Log a habit completion** → Primary Action Button (most frequent - users do this multiple times daily)
2. **Add a new habit** → Secondary action (less frequent - setting up the system)
3. **View progress over time** → Tertiary (motivation/review)

---

## 2. What Makes This Design Distinctive

### Visual Identity
A calm, grounded design that feels like a personal wellness app rather than a corporate tool. The warm cream background creates a paper-like canvas that feels inviting and personal. A rich forest green accent color symbolizes growth and progress - the visual metaphor of cultivating habits like tending a garden. The overall aesthetic is minimalist but warm, encouraging daily use without overwhelming.

### Layout Strategy
- **Hero element**: Today's completion rate dominates the top - a large circular progress ring showing "X of Y habits done today" with the percentage in bold
- **Asymmetric layout on desktop**: Wide left column (65%) with hero + recent activity, narrower right column (35%) with habit list for quick logging
- **Mobile**: Hero takes ~40% of viewport, habits list below with large touch targets for quick check-offs
- **Size variation**: Hero progress ring is dramatically larger than other elements; habit cards are compact; secondary stats are small inline badges
- **Typography hierarchy**: Huge progress percentage (72px), medium habit names (18px), small metadata (14px)

### Unique Element
The hero progress ring uses a thick 12px stroke with a gradient from the primary green to a lighter mint, creating a satisfying "filling up" visual as the day progresses. When at 100%, the ring pulses once with a subtle glow animation - a micro-celebration.

---

## 3. Theme & Colors

### Font
- **Family:** Plus Jakarta Sans
- **URL:** `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap`
- **Why this font:** Modern and friendly with slightly rounded edges that feel approachable. Professional enough for a productivity app but warm enough for personal wellness. Excellent readability at all sizes.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(45 30% 97%)` | `--background` |
| Main text | `hsl(150 25% 15%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(150 25% 15%)` | `--card-foreground` |
| Borders | `hsl(45 15% 88%)` | `--border` |
| Primary action (forest green) | `hsl(152 45% 35%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight (mint) | `hsl(158 40% 90%)` | `--accent` |
| Muted background | `hsl(45 20% 94%)` | `--muted` |
| Muted text | `hsl(150 10% 45%)` | `--muted-foreground` |
| Success/positive | `hsl(152 60% 40%)` | (component use) |
| Error/negative | `hsl(0 65% 50%)` | `--destructive` |

### Why These Colors
The warm cream base (`hsl(45 30% 97%)`) creates a soft, paper-like canvas that feels less harsh than pure white - inviting for daily use. The forest green primary (`hsl(152 45% 35%)`) represents growth and nature, subtly reinforcing the "cultivating habits" metaphor. The color palette is deliberately muted and earthy to create a calm, focused environment.

### Background Treatment
The background is a subtle warm cream (`hsl(45 30% 97%)`), not pure white. This creates visual warmth and reduces eye strain for frequent daily use. Cards are pure white to create gentle contrast and lift off the background.

---

## 4. Mobile Layout (Phone)

### Layout Approach
Mobile is designed for quick daily check-ins. The hero dominates the first viewport to immediately answer "How am I doing today?". The habits list below uses large touch targets (min 48px) for easy one-handed completion toggling. No horizontal scrolling - everything flows vertically.

### What Users See (Top to Bottom)

**Header:**
- Simple header with app title "Gewohnheiten" on the left
- "+" button on the right to add new habit (secondary action)
- Subtle bottom border separating from content

**Hero Section (The FIRST thing users see):**
- Circular progress ring: 160px diameter, 12px stroke width
- Inside the ring: Large percentage (48px bold), e.g., "75%"
- Below the ring: "5 von 7 Gewohnheiten erledigt" (16px, muted)
- Takes approximately 35% of viewport height
- Generous padding around the ring (32px top/bottom)
- Why hero: Users need immediate feedback on today's progress to stay motivated

**Section 2: Today's Habits**
- Section title: "Heute" with today's date (e.g., "Heute, 17. Februar")
- List of habit cards, each showing:
  - Habit name (18px, semibold)
  - Category badge (small, muted background)
  - Checkbox on the right (large, 28px touch target)
  - Optional: quantity input if measurable habit
- Cards have 12px padding, 8px border radius
- Completed habits show muted text with strikethrough and green checkmark
- Swipe left reveals edit/delete actions

**Section 3: Streak & Stats**
- Compact row of 3 stat badges:
  - Current streak: "12 Tage Streak"
  - This week: "23/35"
  - Best streak: "Rekord: 45 Tage"
- Small cards (not full-width), horizontal scroll if needed
- Background: muted, small text

**Bottom Navigation / Action:**
- Fixed bottom button: "Eintrag hinzufügen" (primary color, full width minus padding)
- This is the PRIMARY ACTION - always visible, easy thumb reach
- 56px height, 16px side margins, 12px border radius

### Mobile-Specific Adaptations
- Habits list takes remaining viewport below hero
- Each habit row is 64px minimum height for comfortable touch
- Checkbox is 28px for easy tapping
- Swipe gestures for edit/delete on habit items
- Pull-to-refresh to reload today's data

### Touch Targets
- All interactive elements minimum 44px touch target
- Checkboxes are 28px visible with 44px touch area
- Habit rows are full-width tappable for detail view

### Interactive Elements
- Tap habit row → opens detail sheet showing history + notes
- Tap checkbox → toggles completion (optimistic UI)
- Long press habit → edit mode

---

## 5. Desktop Layout

### Overall Structure
Two-column layout (65% / 35%) with the hero and activity on the left, quick-action habit list on the right. The eye flows: Hero ring (top-left) → Today's habits (right column) → Week overview (below hero).

### Section Layout
**Top Row (Hero + Quick Stats):**
- Left (65%): Hero progress ring (200px diameter) with completion stats
- Right (35%): Streak stats in a vertical card stack

**Main Content Area:**
- Left column (65%):
  - Week activity chart (bar chart showing daily completions for past 7 days)
  - Recent activity list (last 10 entries with timestamps)
- Right column (35%):
  - "Heute" section with scrollable habit list
  - Each habit has inline checkbox for quick toggling
  - "Neue Gewohnheit" button at bottom of list

**Header:**
- App title left
- Primary action button "Eintrag hinzufügen" in header (right side)
- User feels productive immediately

### What Appears on Hover
- Habit rows: subtle background color change, edit icon appears
- Progress ring: tooltip showing "X von Y erledigt"
- Chart bars: tooltip with exact count for that day
- Recent activity items: "Details anzeigen" link appears

### Clickable/Interactive Areas
- Habit rows → click to open edit dialog
- Week chart bars → click to see that day's details
- Recent activity items → click to view/edit that entry

---

## 6. Components

### Hero KPI
The MOST important metric that users see first.

- **Title:** Tagesfortschritt (Today's Progress)
- **Data source:** Tägliche Einträge (filtered to today)
- **Calculation:** Count entries where `erledigt === true` AND `datum === today` / Total active Gewohnheiten
- **Display:** Circular progress ring with percentage inside
  - Ring: 160px mobile / 200px desktop, 12px stroke
  - Percentage: 48px mobile / 72px desktop, font-weight 700
  - Subtitle below: "X von Y Gewohnheiten erledigt"
- **Context shown:** Below the ring, show streak count ("12 Tage in Folge")
- **Why this is the hero:** Users open the app to answer "How am I doing today?" - this answers it instantly with satisfying visual feedback

### Secondary KPIs

**Current Streak**
- Source: Tägliche Einträge
- Calculation: Count consecutive days where at least one habit was completed
- Format: number + "Tage"
- Display: Compact badge card, icon (flame or calendar)

**Week Progress**
- Source: Tägliche Einträge (last 7 days)
- Calculation: Total completed / Total expected (habits × 7)
- Format: "X/Y" with small percentage
- Display: Compact badge card

**Total Habits**
- Source: Gewohnheiten
- Calculation: Count of active habits
- Format: number
- Display: Inline text, not prominent

### Chart

- **Type:** Bar chart - shows daily completion counts, easy to scan pattern
- **Title:** Diese Woche
- **What question it answers:** "Am I being consistent?" - Users see patterns in their behavior
- **Data source:** Tägliche Einträge (last 7 days)
- **X-axis:** Day of week (Mo, Di, Mi, Do, Fr, Sa, So)
- **Y-axis:** Number of habits completed
- **Mobile simplification:** Smaller bars, abbreviated day labels, no axis labels

### Lists/Tables

**Today's Habits (Primary List)**
- Purpose: Quick completion of daily habits - the main interaction
- Source: Gewohnheiten (all active habits)
- Fields shown:
  - Habit name (gewohnheit_name)
  - Category badge (kategorie)
  - Completion checkbox (from Tägliche Einträge for today)
  - Quantity input if messbar === true
- Mobile style: Cards with large touch targets
- Desktop style: Compact list with inline checkboxes
- Sort: By kategorie, then alphabetically
- Limit: Show all active habits

**Recent Activity (Desktop only)**
- Purpose: Review recent progress, see history
- Source: Tägliche Einträge (last 10)
- Fields shown: Habit name (via lookup), datum, erledigt status, menge if applicable
- Desktop style: Simple list with timestamps
- Sort: By datum descending
- Limit: 10 items

### Primary Action Button (REQUIRED!)

- **Label:** "Eintrag hinzufügen"
- **Action:** add_record
- **Target app:** Tägliche Einträge
- **What data:**
  - gewohnheit (select from Gewohnheiten)
  - datum (default: today)
  - erledigt (checkbox, default: true)
  - menge (number, if measurable habit)
  - notizen (textarea, optional)
- **Mobile position:** bottom_fixed (always visible, thumb-friendly)
- **Desktop position:** header (top-right for quick access)
- **Why this action:** Logging completions is what users do most - it must be one tap away

### CRUD Operations Per App (REQUIRED!)

**Gewohnheiten CRUD Operations**

- **Create (Erstellen):**
  - **Trigger:** "Neue Gewohnheit" button in habits list / "+" in header
  - **Form fields:**
    - gewohnheit_name (text input, required)
    - beschreibung (textarea, optional)
    - kategorie (select: Gesundheit & Fitness, Ernährung, Produktivität, Persönliche Entwicklung, Soziales, Finanzen, Sonstiges)
    - ziel_haeufigkeit (select: Täglich, Mehrmals pro Woche, Wöchentlich, Monatlich)
    - startdatum (date input, default: today)
    - zielwert (text input, optional - e.g., "2L Wasser")
    - messbar (checkbox - if checked, entries can have quantity)
  - **Form style:** Dialog/Modal
  - **Required fields:** gewohnheit_name
  - **Default values:** startdatum = today, ziel_haeufigkeit = "taeglich"

- **Read (Anzeigen):**
  - **List view:** Card list in right column (desktop) / main list (mobile)
  - **Detail view:** Click on habit → Sheet/Dialog showing all fields + entry history
  - **Fields shown in list:** gewohnheit_name, kategorie badge
  - **Fields shown in detail:** All fields + recent entries for this habit
  - **Sort:** By kategorie, then alphabetically
  - **Filter/Search:** Optional filter by kategorie

- **Update (Bearbeiten):**
  - **Trigger:** Edit icon (pencil) on hover (desktop) / swipe left (mobile) / in detail view
  - **Edit style:** Same dialog as Create but pre-filled
  - **Editable fields:** All fields

- **Delete (Löschen):**
  - **Trigger:** Trash icon in detail view / swipe left (mobile)
  - **Confirmation:** Always required
  - **Confirmation text:** "Möchtest du die Gewohnheit '{name}' wirklich löschen? Alle zugehörigen Einträge bleiben erhalten."

**Tägliche Einträge CRUD Operations**

- **Create (Erstellen):**
  - **Trigger:** Primary action button "Eintrag hinzufügen" / clicking unchecked habit
  - **Form fields:**
    - gewohnheit (select from Gewohnheiten list, required)
    - datum (date input, default: today)
    - erledigt (checkbox, default: true)
    - menge (number input, shown only if selected habit is messbar)
    - notizen (textarea, optional)
  - **Form style:** Dialog/Modal (from button) or inline toggle (from habit checkbox)
  - **Required fields:** gewohnheit, datum
  - **Default values:** datum = today, erledigt = true

- **Read (Anzeigen):**
  - **List view:** Integrated into Today's Habits section as checkboxes + Recent Activity list
  - **Detail view:** Click on recent activity item → Dialog with full entry
  - **Fields shown in list:** Via habit lookup: completion status, date
  - **Fields shown in detail:** All fields
  - **Sort:** By datum descending
  - **Filter/Search:** By date range, by habit

- **Update (Bearbeiten):**
  - **Trigger:** Click on entry in recent activity / tap completed habit to edit
  - **Edit style:** Same dialog as Create but pre-filled
  - **Editable fields:** erledigt, menge, notizen (gewohnheit and datum usually not changed)

- **Delete (Löschen):**
  - **Trigger:** Trash icon in detail dialog / swipe left on mobile
  - **Confirmation:** Required
  - **Confirmation text:** "Möchtest du diesen Eintrag wirklich löschen?"

**Tagesprotokoll CRUD Operations**

- **Create (Erstellen):**
  - **Trigger:** "Tagesnotiz hinzufügen" button (secondary, in stats section)
  - **Form fields:**
    - protokoll_datum (date input, default: today)
    - erledigte_gewohnheiten (select from Gewohnheiten, optional)
    - tagesnotizen (textarea, main content)
  - **Form style:** Dialog/Modal
  - **Required fields:** protokoll_datum
  - **Default values:** protokoll_datum = today

- **Read (Anzeigen):**
  - **List view:** Small notes indicator if today has a note, or in a "Notizen" tab/section
  - **Detail view:** Click to view full journal entry
  - **Fields shown in list:** Date, first line of tagesnotizen
  - **Fields shown in detail:** All fields
  - **Sort:** By protokoll_datum descending
  - **Filter/Search:** By date

- **Update (Bearbeiten):**
  - **Trigger:** Click on note to edit
  - **Edit style:** Same dialog as Create but pre-filled
  - **Editable fields:** All fields

- **Delete (Löschen):**
  - **Trigger:** Trash icon in detail view
  - **Confirmation:** Required
  - **Confirmation text:** "Möchtest du diese Tagesnotiz wirklich löschen?"

---

## 7. Visual Details

### Border Radius
Rounded (8px) for cards, slightly more (12px) for buttons and larger elements. Creates a soft, approachable feel without being too playful.

### Shadows
Subtle - `0 1px 3px hsl(150 10% 50% / 0.08)` for cards. Slightly more on hover: `0 4px 12px hsl(150 10% 50% / 0.12)`. Shadows have a slight green tint to match the color scheme.

### Spacing
Normal to spacious. 24px between major sections. 16px between cards. 12px internal card padding. Generous whitespace around hero element (32px).

### Animations
- **Page load:** Subtle fade-in (200ms) for content, progress ring fills from 0 to current value (800ms ease-out)
- **Hover effects:** Background color transition (150ms), shadow elevation (150ms)
- **Tap feedback:** Scale down to 0.98 (100ms), back to 1 (100ms)
- **Completion toggle:** Checkbox bounces slightly, strikethrough animates across text (200ms)
- **100% completion:** Ring pulses once with glow (400ms)

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
:root {
  --background: hsl(45 30% 97%);
  --foreground: hsl(150 25% 15%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(150 25% 15%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(150 25% 15%);
  --primary: hsl(152 45% 35%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(45 20% 94%);
  --secondary-foreground: hsl(150 25% 25%);
  --muted: hsl(45 20% 94%);
  --muted-foreground: hsl(150 10% 45%);
  --accent: hsl(158 40% 90%);
  --accent-foreground: hsl(150 25% 15%);
  --destructive: hsl(0 65% 50%);
  --border: hsl(45 15% 88%);
  --input: hsl(45 15% 88%);
  --ring: hsl(152 45% 35%);
  --radius: 0.5rem;
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from URL above (Plus Jakarta Sans)
- [ ] All CSS variables copied exactly
- [ ] Mobile layout matches Section 4
- [ ] Desktop layout matches Section 5
- [ ] Hero progress ring is prominent as described (160px mobile / 200px desktop)
- [ ] Colors create the warm, growth-oriented mood described in Section 2
- [ ] CRUD patterns are consistent across all apps
- [ ] Delete confirmations are in place for all delete actions
- [ ] Primary action "Eintrag hinzufügen" is always visible on mobile (fixed bottom)
- [ ] Habit checkboxes toggle completion inline
- [ ] Streak calculation works correctly
- [ ] Week chart shows last 7 days
