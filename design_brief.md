# Design Brief: Gewohnheitstracker

## 1. App Analysis

### What This App Does
The Gewohnheitstracker (Habit Tracker) helps users build and maintain positive habits by tracking daily completions, logging measurable values, and reviewing their consistency over time. It connects three data sources: a master list of habits (Gewohnheiten), daily habit entries (Tägliche Einträge) with completion status and optional quantity values, and a daily journal/protocol (Tagesprotokoll) for reflective notes.

### Who Uses This
A motivated individual (likely German-speaking) who wants to build better routines. They're not a power user — they want a quick glance at how they're doing, and a fast way to log today's habits. They open this dashboard daily, usually in the morning or evening.

### The ONE Thing Users Care About Most
**"How am I doing this week?"** — Users want to immediately see their current streak and weekly completion rate. The hero must answer: "Am I on track with my habits?"

### Primary Actions (IMPORTANT!)
1. **Eintrag erfassen** (Log a habit entry) → Primary Action Button — this is what users do every single day
2. Create/manage habits (less frequent, but needed)
3. Write daily notes in the Tagesprotokoll

---

## 2. What Makes This Design Distinctive

### Visual Identity
A warm, grounded palette inspired by natural journaling — soft sand background with a deep forest-green accent that evokes growth and consistency. The design feels like opening a well-loved planner, not a clinical data tool. The green accent is used sparingly on the hero completion ring and primary buttons, creating a visual metaphor: green = growth = progress.

### Layout Strategy
- The hero is a large circular progress ring showing this week's habit completion rate, placed prominently at the top center on mobile and as the left anchor on desktop. It's visually dominant through size (not just color) — roughly 2x the visual weight of any secondary element.
- The layout is **asymmetric on desktop** (wide left hero column + narrower right activity column) to create natural reading flow: see progress → check details → take action.
- **Size variation** creates interest: the hero ring is large and bold, secondary KPI chips are compact inline elements (not cards), and the habit list uses generous spacing with subtle category color dots.
- On mobile, a **single-column vertical flow** with the hero ring taking the entire first viewport fold, then compact KPI row, then habit list.

### Unique Element
A thick (10px) circular progress ring for the weekly completion rate with rounded stroke caps and a subtle drop shadow behind it. The ring fills clockwise with the forest-green accent color against a light sage track. Inside the ring: the percentage in 48px bold weight, with "diese Woche" in small muted text below. This creates an almost game-like "fill the ring" motivation similar to Apple Watch activity rings.

---

## 3. Theme & Colors

### Font
- **Family:** DM Sans
- **URL:** `https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700;1,9..40,300&display=swap`
- **Why this font:** DM Sans has a friendly, rounded geometry that feels approachable for a personal habit tracker, while maintaining excellent readability at all sizes. Its optical sizing and weight range allow for strong typographic hierarchy (300 for labels, 500 for body, 700 for hero numbers).

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(39 32% 96%)` | `--background` |
| Main text | `hsl(160 20% 12%)` | `--foreground` |
| Card background | `hsl(40 33% 99%)` | `--card` |
| Card text | `hsl(160 20% 12%)` | `--card-foreground` |
| Borders | `hsl(40 18% 88%)` | `--border` |
| Primary action (forest green) | `hsl(158 45% 30%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight (sage) | `hsl(145 20% 92%)` | `--accent` |
| Muted background | `hsl(40 15% 94%)` | `--muted` |
| Muted text | `hsl(160 8% 48%)` | `--muted-foreground` |
| Success/positive | `hsl(145 55% 42%)` | (component use) |
| Error/negative | `hsl(0 65% 51%)` | `--destructive` |

### Why These Colors
The warm sand base (`hsl(39 32% 96%)`) creates a calm, inviting canvas — like aged paper. The forest green primary (`hsl(158 45% 30%)`) represents growth and accomplishment without feeling clinical. Together they create an earthy, grounded mood that encourages daily engagement rather than feeling like a chore.

### Background Treatment
The page background uses a single warm off-white `hsl(39 32% 96%)`. Cards sit on a very slightly lighter `hsl(40 33% 99%)` with subtle `1px` borders in `hsl(40 18% 88%)`, creating gentle depth without heavy shadows. No gradients or textures — the warmth comes from the color tones themselves.

---

## 4. Mobile Layout (Phone)

### Layout Approach
The hero progress ring dominates the first viewport fold (~55% of visible height), creating an unmistakable focal point. Below it, a compact horizontal row of secondary stats provides context without competing. Then a scrollable habit checklist for today, followed by the recent journal entries. The primary action button is fixed at the bottom.

### What Users See (Top to Bottom)

**Header:**
- Left: App title "Gewohnheitstracker" in 18px font-weight 700
- Right: "+" icon button (secondary, opens habit management)
- Minimal height, no background color — just text on the warm background

**Hero Section (The FIRST thing users see):**
- A large circular SVG progress ring, centered horizontally
- Ring diameter: ~200px, stroke width 10px, rounded caps
- Track color: `hsl(145 20% 92%)` (accent/sage)
- Fill color: `hsl(158 45% 30%)` (primary/forest green)
- Subtle box-shadow on the ring container: `0 4px 20px hsl(158 45% 30% / 0.1)`
- Inside the ring center: completion percentage in 48px font-weight 700
- Below the number: "diese Woche" in 13px font-weight 300, muted-foreground color
- Below the ring (outside): "X von Y Gewohnheiten erledigt" in 14px font-weight 500
- **Why this is the hero:** It answers the #1 question — "Am I on track?" — in under 1 second

**Section 2: Quick Stats Row**
- Horizontal row of 3 compact stat chips (not full cards), separated by thin vertical dividers
- Each chip: label in 11px uppercase muted text, value in 20px font-weight 700
- Stats: "Streak" (consecutive days with ≥1 completion), "Heute" (today's completed count / total habits), "Monat" (this month's completion rate %)
- No borders, no cards — just inline typography on the background

**Section 3: Heutige Gewohnheiten (Today's Habits)**
- Section header: "Heute" in 16px font-weight 700, with a filter chip "Alle / Offen" toggle on the right
- List of habit items, each as a row in a single card:
  - Left: small colored dot (6px circle) based on category (Gesundheit=green, Ernährung=orange, Produktivität=blue, Persönliche Entwicklung=purple, Soziales=pink, Finanzen=yellow, Sonstiges=gray)
  - Center: habit name in 15px font-weight 500, frequency badge below in 12px muted
  - Right: checkbox circle (24px). If completed, filled green with white checkmark. If not, empty circle with border.
  - If habit is measurable (messbar=true), show a small input field for "Menge/Wert" next to the checkbox
- Tapping a habit name opens its detail (edit/delete)
- Each row has a subtle bottom border, last row has none

**Section 4: Tagesprotokoll**
- Section header: "Tagesnotizen" in 16px font-weight 700, "+" button on right to add new entry
- List of recent journal entries (last 5), each as a compact card:
  - Date in 13px font-weight 700
  - Note preview (first 100 chars) in 14px font-weight 300
  - Referenced habit name (from erledigte_gewohnheiten lookup) as a small badge
- Tapping an entry opens detail view (edit/delete)

**Section 5: Gewohnheiten verwalten**
- Section header: "Meine Gewohnheiten" in 16px font-weight 700, "+" button to create
- Compact list grouped by category
- Each habit: name, frequency badge, description preview
- Tap to edit, swipe to delete

**Bottom Navigation / Action:**
- Fixed bottom button bar with the primary action "Eintrag erfassen" — full-width button in primary green, 48px height, 16px font-weight 700 white text, rounded-lg
- 16px padding from screen edges, 12px padding from bottom (safe area aware)

### Mobile-Specific Adaptations
- Hero ring slightly smaller on very small screens (<375px): 160px diameter
- Quick stats row scrolls horizontally if text is clipped
- Habit list items have 48px minimum tap height
- Journal entries truncated at 2 lines with ellipsis

### Touch Targets
- All interactive elements minimum 44px touch target
- Checkbox circles 44px tap area (even though visually 24px)
- Bottom action button full-width for easy thumb reach

### Interactive Elements
- Habit checkboxes toggle completion directly (PATCH to Tägliche Einträge)
- Habit name tap → detail dialog with edit/delete
- Journal entry tap → detail dialog with edit/delete
- "Meine Gewohnheiten" items tap → edit dialog

---

## 5. Desktop Layout

### Overall Structure
A max-width 1200px centered container with 3-column asymmetric grid:
- **Left column (45%):** Hero progress ring + weekly trend chart below it
- **Center column (30%):** Today's habit checklist
- **Right column (25%):** Quick stats stack + recent journal entries

The eye flows: hero ring (top-left, largest element) → today's habits (center, the actionable content) → stats and journal (right, supporting context).

### Section Layout

**Top Bar (full width):**
- Left: "Gewohnheitstracker" in 24px font-weight 700
- Right: Primary action button "Eintrag erfassen" (primary green, medium size) + secondary "+" button for habit management

**Left Column:**
- Hero progress ring (240px diameter, same styling as mobile but larger)
- Below: "X von Y Gewohnheiten diese Woche erledigt" in 16px
- Below: Weekly trend area chart (7 days, showing daily completion count as bars). X-axis: day abbreviations (Mo, Di, Mi...), Y-axis: count. Uses primary green color with 20% opacity fill.
- Chart is inside a card with subtle border, title "Wochenverlauf"

**Center Column:**
- Card titled "Heute" with the habit checklist
- Same row format as mobile: category dot + name + frequency badge + checkbox
- Measurable habits show inline input for Menge/Wert
- Edit/delete on hover (pencil + trash icons appear on row hover)
- Filter toggle "Alle / Offen" in card header
- Scrollable if many habits (max-height 500px with scroll)

**Right Column:**
- **Quick Stats Stack:** 3 stat cards stacked vertically (Streak, Heute, Monatsrate), each compact — value large (28px bold), label small (12px muted uppercase)
- **Tagesnotizen:** Card with list of recent 5 journal entries. Each: date bold, note preview, habit badge. Click to expand/edit.
- **Meine Gewohnheiten:** Card with habit management list, grouped by category. Edit/delete on hover.

### What Appears on Hover
- Habit rows in center column: pencil (edit) and trash (delete) icons fade in on the right side
- Journal entries: "Bearbeiten" link appears
- Habit management items: edit/delete icons appear
- Cards: subtle shadow increase on hover (`shadow-sm` → `shadow-md`)
- Chart bars: tooltip showing exact count and date

### Clickable/Interactive Areas
- Habit checkboxes: toggle completion
- Habit rows: click name to open detail dialog
- Journal entries: click to open edit dialog
- Chart bars: hover tooltip with details
- Stats cards: no drill-down needed (self-explanatory numbers)

---

## 6. Components

### Hero KPI
The MOST important metric that users see first.

- **Title:** Wöchentliche Erfüllungsrate
- **Data source:** Tägliche Einträge (filtered to current week) cross-referenced with Gewohnheiten
- **Calculation:** Count entries where `erledigt === true` this week / (total habits × days elapsed this week) × 100. For habits with `ziel_haeufigkeit` of "wöchentlich" or "monatlich", count them only once against their frequency target.
- **Display:** Large circular SVG progress ring (200px mobile / 240px desktop). Percentage inside in 48px bold. "diese Woche" label below in 13px light.
- **Context shown:** "X von Y Gewohnheiten erledigt" text below the ring
- **Why this is the hero:** It's the single number that tells users if they're on track. The visual ring creates motivation to "fill it up" — gamifying consistency.

### Secondary KPIs

**Aktuelle Streak**
- Source: Tägliche Einträge
- Calculation: Count consecutive days (going backwards from today) where at least 1 habit was completed (erledigt=true)
- Format: number + "Tage" suffix
- Display: Compact stat chip (mobile) / small stat card (desktop), 20-28px bold value

**Heute**
- Source: Tägliche Einträge (filtered to today) + Gewohnheiten (total count)
- Calculation: Count today's completed entries / total number of habits
- Format: "X / Y" fraction
- Display: Compact stat chip / small stat card

**Monatsrate**
- Source: Tägliche Einträge (filtered to current month)
- Calculation: Completed entries this month / (total habits × days elapsed this month) × 100
- Format: percentage with 0 decimals + "%" suffix
- Display: Compact stat chip / small stat card

### Chart
- **Type:** Bar chart — shows discrete daily counts, easier to read than line for 7 data points
- **Title:** "Wochenverlauf"
- **What question it answers:** "Which days did I do well, and which did I skip?" — helps users see patterns in their week
- **Data source:** Tägliche Einträge, filtered to current week (Monday–Sunday)
- **X-axis:** Day of week (Mo, Di, Mi, Do, Fr, Sa, So)
- **Y-axis:** Number of habits completed that day
- **Colors:** Bars in primary green (`hsl(158 45% 30%)`) with 80% opacity, today's bar at 100% opacity
- **Mobile simplification:** Smaller font sizes on axes, no Y-axis labels (just bars with value on top), reduced height (180px vs 250px desktop)

### Lists/Tables

**Heutige Gewohnheiten**
- Purpose: The actionable daily checklist — what needs to be done today
- Source: Gewohnheiten (all habits) + Tägliche Einträge (today's entries matched by applookup)
- Fields shown: Category dot, habit name, frequency badge, completion checkbox, Menge input (if messbar)
- Mobile style: Simple list rows with bottom borders in a single card
- Desktop style: Same list rows in a card, hover reveals edit/delete actions
- Sort: By category, then alphabetically by name
- Limit: All habits shown (scrollable)

**Tagesnotizen (Journal)**
- Purpose: Reflection and daily notes for accountability
- Source: Tagesprotokoll
- Fields shown: Date (bold), note preview, referenced habit badge
- Mobile style: Compact cards
- Desktop style: List in a card
- Sort: By protokoll_datum descending (newest first)
- Limit: 5 most recent

**Meine Gewohnheiten (Habit Management)**
- Purpose: View and manage all tracked habits
- Source: Gewohnheiten
- Fields shown: Name, category badge, frequency, description preview, messbar indicator
- Mobile style: Grouped list by category
- Desktop style: Grouped list in a card with hover actions
- Sort: Grouped by kategorie, then alphabetically
- Limit: All habits

### Primary Action Button (REQUIRED!)

- **Label:** "Eintrag erfassen"
- **Action:** add_record
- **Target app:** Tägliche Einträge (taegliche_eintraege)
- **What data:** Dialog with fields:
  - Gewohnheit: Select dropdown populated from Gewohnheiten app (applookup)
  - Datum: Date input, defaults to today (YYYY-MM-DD format)
  - Erledigt: Checkbox, defaults to true
  - Menge/Wert: Number input (only shown if selected habit has messbar=true)
  - Notizen: Textarea, optional
- **Mobile position:** bottom_fixed — full-width green button pinned to bottom
- **Desktop position:** header — medium button in the top-right area
- **Why this action:** Logging a habit entry is what users do every single day, usually multiple times. It must be instant-access.

### CRUD Operations Per App (REQUIRED!)

**Tägliche Einträge CRUD Operations**

- **Create (Erstellen):**
  - Trigger: Primary action button "Eintrag erfassen" OR checkbox toggle in today's habit list (auto-creates entry)
  - Form fields: Gewohnheit (select from Gewohnheiten, applookup), Datum (date, default today), Erledigt (checkbox, default true), Menge (number, conditional on messbar), Notizen (textarea)
  - Form style: Dialog/Modal
  - Required fields: Gewohnheit, Datum
  - Default values: Datum = today, Erledigt = true

- **Read (Anzeigen):**
  - List view: Shown as part of "Heutige Gewohnheiten" checklist — each habit shows its completion status
  - Detail view: Click on habit row → Dialog showing all fields (Gewohnheit name, Datum, Erledigt, Menge, Notizen)
  - Fields shown in list: Habit name (resolved from applookup), completion status, Menge if applicable
  - Fields shown in detail: All fields
  - Sort: By category of linked habit
  - Filter/Search: Filter by "Alle / Offen" toggle (all vs uncompleted only)

- **Update (Bearbeiten):**
  - Trigger: Click pencil icon on habit row (desktop hover) or tap habit name (mobile) → opens detail dialog with "Bearbeiten" button
  - Edit style: Same dialog as Create but pre-filled with current values
  - Editable fields: All fields (Gewohnheit, Datum, Erledigt, Menge, Notizen)

- **Delete (Löschen):**
  - Trigger: Click trash icon on habit row (desktop hover) or delete button in detail dialog
  - Confirmation: AlertDialog with confirmation
  - Confirmation text: "Möchtest du diesen Eintrag vom {datum} wirklich löschen?"

**Tagesprotokoll CRUD Operations**

- **Create (Erstellen):**
  - Trigger: "+" button next to "Tagesnotizen" section header
  - Form fields: Datum (date, default today), Erledigte Gewohnheiten (select from Gewohnheiten, applookup, optional), Tagesnotizen (textarea)
  - Form style: Dialog/Modal
  - Required fields: Datum
  - Default values: Datum = today

- **Read (Anzeigen):**
  - List view: Compact cards showing date + note preview + habit badge
  - Detail view: Click entry → Dialog showing full note text and all fields
  - Fields shown in list: Datum, note preview (100 chars), habit badge
  - Fields shown in detail: All fields with full note text
  - Sort: By protokoll_datum descending
  - Filter/Search: No filter needed (small dataset)

- **Update (Bearbeiten):**
  - Trigger: Click entry → detail dialog has "Bearbeiten" button. On desktop, "Bearbeiten" link on hover.
  - Edit style: Same dialog as Create but pre-filled
  - Editable fields: All fields

- **Delete (Löschen):**
  - Trigger: Delete button in detail dialog, or trash icon on hover (desktop)
  - Confirmation: AlertDialog
  - Confirmation text: "Möchtest du den Tageseintrag vom {datum} wirklich löschen?"

**Gewohnheiten CRUD Operations**

- **Create (Erstellen):**
  - Trigger: "+" button in header (mobile) or next to "Meine Gewohnheiten" section header
  - Form fields: Name der Gewohnheit (text input), Beschreibung (textarea), Kategorie (select: Gesundheit & Fitness, Ernährung, Produktivität, Persönliche Entwicklung, Soziales, Finanzen, Sonstiges), Zielhäufigkeit (select: Täglich, Mehrmals pro Woche, Wöchentlich, Monatlich), Startdatum (date, default today), Ziel/Zielwert (text input), Messbare Gewohnheit (checkbox)
  - Form style: Dialog/Modal
  - Required fields: Name der Gewohnheit
  - Default values: Startdatum = today, Kategorie = "sonstiges", Zielhäufigkeit = "taeglich"

- **Read (Anzeigen):**
  - List view: Grouped by category, showing name + frequency badge + description preview
  - Detail view: Click habit → Dialog showing all fields
  - Fields shown in list: Name, category (color dot + label), frequency badge, messbar indicator
  - Fields shown in detail: All fields
  - Sort: Grouped by kategorie, alphabetical within group
  - Filter/Search: No filter needed

- **Update (Bearbeiten):**
  - Trigger: Click habit row → detail dialog has "Bearbeiten" button. Desktop: pencil icon on hover.
  - Edit style: Same dialog as Create, pre-filled
  - Editable fields: All fields

- **Delete (Löschen):**
  - Trigger: Delete button in detail dialog, trash icon on hover (desktop), swipe left (mobile)
  - Confirmation: AlertDialog
  - Confirmation text: "Möchtest du die Gewohnheit '{name}' wirklich löschen? Zugehörige Einträge bleiben erhalten."

---

## 7. Visual Details

### Border Radius
Rounded (8px) — `--radius: 0.5rem` — friendly and approachable but not overly playful

### Shadows
Subtle — cards use `shadow-none` by default with only a 1px border. On hover: `shadow-sm`. The hero ring container has a special ambient shadow: `0 4px 20px hsl(158 45% 30% / 0.1)`. This keeps the design clean and lets the warm background color do the work.

### Spacing
Spacious — generous padding inside cards (24px), comfortable gaps between sections (24px mobile, 32px desktop). The hero section has extra breathing room (40px top/bottom mobile). This creates a calm, uncluttered feel that matches the journaling aesthetic.

### Animations
- **Page load:** Staggered fade-in — hero ring fades in first (with a brief ring fill animation from 0% to current value over 600ms, ease-out), then secondary stats fade in, then lists fade in. Each delay: 100ms.
- **Hover effects:** Cards get `shadow-sm` on hover with 200ms transition. Buttons get subtle scale (1.02) on hover.
- **Tap feedback:** Checkboxes have a brief scale pulse (1.1 → 1.0) on toggle, 150ms. Buttons have active:scale-[0.98].
- **Ring animation:** On data load, the progress ring animates from 0 to actual percentage over 800ms with ease-out timing.

---

## 8. CSS Variables (Copy Exactly!)

```css
:root {
  --radius: 0.5rem;
  --background: hsl(39 32% 96%);
  --foreground: hsl(160 20% 12%);
  --card: hsl(40 33% 99%);
  --card-foreground: hsl(160 20% 12%);
  --popover: hsl(40 33% 99%);
  --popover-foreground: hsl(160 20% 12%);
  --primary: hsl(158 45% 30%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(145 20% 92%);
  --secondary-foreground: hsl(160 20% 12%);
  --muted: hsl(40 15% 94%);
  --muted-foreground: hsl(160 8% 48%);
  --accent: hsl(145 20% 92%);
  --accent-foreground: hsl(160 20% 12%);
  --destructive: hsl(0 65% 51%);
  --border: hsl(40 18% 88%);
  --input: hsl(40 18% 88%);
  --ring: hsl(158 45% 30%);
  --chart-1: hsl(158 45% 30%);
  --chart-2: hsl(145 55% 42%);
  --chart-3: hsl(39 70% 55%);
  --chart-4: hsl(200 50% 50%);
  --chart-5: hsl(280 40% 55%);
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font "DM Sans" loaded from URL above
- [ ] All CSS variables copied exactly from Section 8
- [ ] Mobile layout matches Section 4 — hero ring dominant, fixed bottom action button
- [ ] Desktop layout matches Section 5 — 3-column asymmetric grid
- [ ] Hero progress ring is prominent with SVG circle, 10px stroke, rounded caps
- [ ] Colors create the warm, earthy mood described in Section 2
- [ ] CRUD patterns are consistent across all 3 apps (same dialog style, same button placement)
- [ ] Delete confirmations are in place for all 3 apps
- [ ] Category color dots match: Gesundheit=green, Ernährung=orange, Produktivität=blue, Pers. Entwicklung=purple, Soziales=pink, Finanzen=yellow, Sonstiges=gray
- [ ] Ring animation plays on load (0 → actual value, 800ms ease-out)
- [ ] Checkbox toggle directly creates/updates Tägliche Einträge via API
- [ ] Toast feedback on every CRUD operation
