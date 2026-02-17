# Design Brief: Gewohnheitstracker

## 1. App Analysis

### What This App Does
Der Gewohnheitstracker hilft Nutzern dabei, tägliche Gewohnheiten zu definieren, zu tracken und langfristig aufzubauen. Nutzer können Gewohnheiten in verschiedenen Kategorien (Gesundheit, Ernährung, Produktivität etc.) anlegen, mit Zielhäufigkeiten versehen und täglich abhaken. Das Tagesprotokoll bietet eine Übersicht über den Tageserfolg.

### Who Uses This
Menschen, die ihre Gewohnheiten verbessern wollen - von Fitness-Enthusiasten über Berufstätige, die produktiver werden wollen, bis hin zu Menschen, die einfach mehr Struktur in ihren Alltag bringen möchten. Sie sind motiviert, aber brauchen ein einfaches Tool, das sie nicht überfordert.

### The ONE Thing Users Care About Most
**Habe ich heute meine Gewohnheiten erledigt?** - Die sofortige Übersicht über den aktuellen Tag: Wie viele Gewohnheiten sind erledigt, wie viele stehen noch aus, und wie ist meine Streak (Serie an erfolgreichen Tagen)?

### Primary Actions (IMPORTANT!)
1. **Gewohnheit als erledigt markieren** → Primary Action Button (Schnelles Abhaken)
2. **Neuen Eintrag für heute hinzufügen** → Schnellzugriff
3. **Neue Gewohnheit anlegen** → Sekundäre Aktion

---

## 2. What Makes This Design Distinctive

### Visual Identity
Eine warme, einladende Farbpalette mit sanftem Grün als Akzentfarbe schafft eine motivierende, aber nicht aufdringliche Atmosphäre. Das Design fühlt sich an wie ein persönliches Journal - warm, einladend und inspirierend. Der cremefarbene Hintergrund mit subtilen grünen Akzenten vermittelt Wachstum und positive Veränderung ohne dabei steril oder kalt zu wirken.

### Layout Strategy
- **Hero-Element:** Ein großer Fortschrittsring zeigt prominent den Tagesfortschritt (z.B. "5 von 7 erledigt") - dieser dominiert den oberen Bereich und gibt sofortige Motivation
- **Asymmetrisches Layout:** Der Hero nimmt 60% der Aufmerksamkeit ein, die Gewohnheitsliste darunter ist kompakt und funktional
- **Visuelle Variation:** Der Progress-Ring als Hero vs. kompakte Checkboxen für einzelne Gewohnheiten schafft klare Hierarchie
- **Sekundäre Elemente:** Kategorie-Badges und Streak-Anzeigen sind dezent, aber erkennbar

### Unique Element
Der **Progress-Ring** im Hero-Bereich ist das Herzstück: Ein dicker (10px) Fortschrittskreis mit abgerundeten Enden, der sich mit einer sanften Animation füllt. Im Zentrum steht die Zahl der erledigten Gewohnheiten in großer, fetter Schrift. Der Ring nutzt einen Farbverlauf von Mint zu Smaragd, der Fortschritt visualisiert und zum Weitermachen motiviert.

---

## 3. Theme & Colors

### Font
- **Family:** Plus Jakarta Sans
- **URL:** `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap`
- **Why this font:** Plus Jakarta Sans ist modern und freundlich, aber nicht kindlich. Die leicht gerundeten Formen vermitteln Wärme, während die klare Struktur professionell wirkt - perfekt für ein persönliches Productivity-Tool.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(45 30% 97%)` | `--background` |
| Main text | `hsl(150 10% 15%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(150 10% 15%)` | `--card-foreground` |
| Borders | `hsl(45 15% 88%)` | `--border` |
| Primary action | `hsl(152 55% 40%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(152 45% 92%)` | `--accent` |
| Muted background | `hsl(45 20% 94%)` | `--muted` |
| Muted text | `hsl(150 5% 45%)` | `--muted-foreground` |
| Success/positive | `hsl(152 60% 45%)` | (component use) |
| Error/negative | `hsl(0 65% 55%)` | `--destructive` |

### Why These Colors
Die Farbpalette basiert auf **sanftem Grün** (Wachstum, Natur, Erfolg) kombiniert mit **warmem Creme** (Einladend, persönlich, nicht steril). Das Grün ist bewusst nicht zu grell gewählt - es soll motivieren, nicht unter Druck setzen. Der cremefarbene Hintergrund gibt dem Design Wärme und unterscheidet es von kalten Productivity-Apps.

### Background Treatment
Der Hintergrund ist ein warmes Off-White mit leichtem Gelbstich (hsl(45 30% 97%)), das die Augen schont und dem Design Charakter verleiht. Cards heben sich durch reines Weiß und subtile Schatten ab.

---

## 4. Mobile Layout (Phone)

Design mobile as a COMPLETELY SEPARATE experience, not squeezed desktop.

### Layout Approach
Der Hero (Progress-Ring) dominiert den ersten Viewport und schafft sofortige emotionale Verbindung. Darunter folgt die interaktive Gewohnheitsliste. Die Hierarchie ist klar: Zuerst sehen, dann handeln.

### What Users See (Top to Bottom)

**Header:**
- Titel "Gewohnheitstracker" links (600 weight, 20px)
- Rechts: Icon-Button für "Neue Gewohnheit" (+)
- Höhe: 56px, sticky am oberen Rand

**Hero Section (The FIRST thing users see):**
- **Progress-Ring:** 180px Durchmesser, zentriert
- Im Zentrum: Große Zahl (48px, 800 weight) der erledigten Gewohnheiten
- Darunter klein: "von X heute" (14px, muted)
- Unterhalb des Rings: Streak-Anzeige als Badge ("7 Tage in Folge")
- Hintergrund: Subtle gradient von accent zu transparent
- **Warum Hero:** Dies beantwortet sofort die wichtigste Frage: "Wie weit bin ich heute?"
- Nimmt etwa 35% des Viewports ein

**Section 2: Heute zu erledigen**
- Überschrift "Heute" mit Datum (formatiert als "Di, 17. Feb")
- Liste aller Gewohnheiten für heute
- Jede Gewohnheit als Card mit:
  - Links: Checkbox (rund, 24px) - primäre Interaktion
  - Mitte: Name der Gewohnheit (16px, 600 weight)
  - Kategorie als farbiger Badge (klein, rounded-full)
  - Wenn messbar: Eingabefeld für Menge/Wert
- Erledigte Gewohnheiten: durchgestrichen, muted, Checkbox grün gefüllt

**Section 3: Gewohnheiten verwalten**
- Überschrift "Meine Gewohnheiten" mit Count-Badge
- Liste aller definierten Gewohnheiten (kompakter als oben)
- Jede Gewohnheit zeigt: Name, Kategorie, Häufigkeit
- Swipe-Geste: Links = Bearbeiten, Rechts = Löschen
- Tap: Details anzeigen

**Bottom Navigation / Action:**
- Floating Action Button (FAB) unten rechts
- Icon: Plus, 56px Durchmesser
- Primärfarbe, sanfter Schatten
- Aktion: "Neuen Eintrag für heute hinzufügen"

### Mobile-Specific Adaptations
- Gewohnheiten-Cards sind vollbreit (keine Margins außer padding)
- Touch-Targets mindestens 44px
- Checkbox ist großzügig tippbar (24px visuell, 44px Hitbox)
- Swipe-Aktionen für Edit/Delete statt sichtbarer Icons

### Touch Targets
- Alle interaktiven Elemente mindestens 44x44px Hitbox
- Checkboxen: 24px visuell, 44px tippbar
- FAB: 56px
- List Items: Gesamte Zeile ist tippbar für Details

### Interactive Elements
- Tap auf Gewohnheit in "Heute": Toggle erledigt/nicht erledigt
- Tap auf Gewohnheit in "Meine Gewohnheiten": Detail-Dialog
- Long Press: Kontextmenü (Bearbeiten, Löschen)

---

## 5. Desktop Layout

### Overall Structure
2-Spalten-Layout mit asymmetrischer Aufteilung:
- **Linke Spalte (65%):** Hero + Heute-Liste
- **Rechte Spalte (35%):** Gewohnheiten-Management + Statistiken
- Max-Width: 1200px, zentriert
- Padding: 32px

### Section Layout

**Linke Spalte:**
1. Hero-Bereich: Progress-Ring (240px) links, daneben Statistiken (Streak, Woche, Monat)
2. "Heute" Karte: Vollbreite, Gewohnheiten als Liste mit inline Checkbox-Toggle
3. Optionale Chart-Sektion: Wöchentlicher Verlauf als Balkendiagramm

**Rechte Spalte:**
1. "Meine Gewohnheiten" Karte mit Liste aller Gewohnheiten
2. Edit/Delete Buttons sichtbar (nicht nur per Hover)
3. Button "Neue Gewohnheit" am oberen Rand der Karte

### What Appears on Hover
- Gewohnheits-Cards: Leichter Schatten-Anstieg, Edit/Delete Icons werden prominenter
- Checkboxen: Scale-Animation (1.1x)
- Progress-Ring: Pulsiert sanft

### Clickable/Interactive Areas
- Checkbox togglet Erledigt-Status direkt
- Gewohnheits-Name öffnet Detail-Dialog
- Edit-Icon öffnet Bearbeiten-Dialog
- Delete-Icon öffnet Bestätigungs-Dialog

---

## 6. Components

### Hero KPI
The MOST important metric that users see first.

- **Title:** Tagesfortschritt
- **Data source:** Tägliche Einträge (taegliche_eintraege) gefiltert auf heute
- **Calculation:** Count von erledigten Einträgen (erledigt === true) / Count aller aktiven Gewohnheiten
- **Display:** Großer Progress-Ring (180px mobile, 240px desktop) mit Prozent/Absolute im Zentrum
- **Context shown:** "X von Y erledigt" + Streak (aufeinanderfolgende Tage mit 100%)
- **Why this is the hero:** Beantwortet sofort die wichtigste Frage des Nutzers und motiviert zum Weitermachen

### Secondary KPIs
**Aktuelle Streak**
- Source: Tägliche Einträge
- Calculation: Anzahl aufeinanderfolgender Tage (inkl. heute) mit mindestens einer erledigten Gewohnheit
- Format: "X Tage" mit Flammen-Icon
- Display: Badge unter dem Hero

**Woche**
- Source: Tägliche Einträge der letzten 7 Tage
- Calculation: Durchschnitt der täglichen Completion-Rate
- Format: Prozent
- Display: Kleine Karte (Desktop) / Badge (Mobile)

**Gesamt Gewohnheiten**
- Source: Gewohnheiten
- Calculation: Count
- Format: Zahl
- Display: Im Header der Gewohnheiten-Liste

### Chart
- **Type:** Bar Chart - Balken eignen sich perfekt um den täglichen Fortschritt zu visualisieren, da jeder Tag ein diskreter Wert ist
- **Title:** Letzte 7 Tage
- **What question it answers:** Wie konsistent war ich diese Woche?
- **Data source:** Tägliche Einträge der letzten 7 Tage
- **X-axis:** Wochentag (Mo, Di, Mi...)
- **Y-axis:** Anzahl erledigter Gewohnheiten
- **Mobile simplification:** Nur auf Desktop anzeigen; auf Mobile als einfache "X/7 Tage erfolgreich" Badge

### Lists/Tables

**Heute zu erledigen**
- Purpose: Schnelles Abhaken der heutigen Gewohnheiten
- Source: Gewohnheiten (alle) + Tägliche Einträge (heute)
- Fields shown: Gewohnheitsname, Kategorie-Badge, Checkbox, optional Menge/Wert-Input
- Mobile style: Cards mit großen Touch-Targets
- Desktop style: Kompakte Listenzeilen mit inline Checkbox
- Sort: Nicht erledigt zuerst, dann erledigt
- Limit: Alle (typischerweise 5-10)

**Meine Gewohnheiten**
- Purpose: Verwalten aller definierten Gewohnheiten
- Source: Gewohnheiten
- Fields shown: Name, Kategorie, Häufigkeit, Startdatum
- Mobile style: Kompakte Cards mit Swipe-Aktionen
- Desktop style: Tabelle mit Action-Buttons
- Sort: Alphabetisch nach Name
- Limit: Alle

### Primary Action Button (REQUIRED!)

- **Label:** "Eintrag hinzufügen"
- **Action:** add_record
- **Target app:** Tägliche Einträge (taegliche_eintraege)
- **What data:**
  - gewohnheit (Select aus Gewohnheiten-Liste)
  - datum (Default: heute)
  - erledigt (Checkbox, default: true)
  - menge (optional, wenn messbare Gewohnheit)
  - notizen (optional textarea)
- **Mobile position:** FAB unten rechts (bottom_fixed)
- **Desktop position:** Button in der "Heute" Card Header
- **Why this action:** Das schnelle Hinzufügen eines Eintrags ist die häufigste Aktion - Nutzer wollen ihre Gewohnheit mit einem Klick als erledigt markieren

### CRUD Operations Per App (REQUIRED!)

**Gewohnheiten CRUD Operations**

- **Create (Erstellen):**
  - **Trigger:** "Neue Gewohnheit" Button in Header (Mobile) oder rechte Spalte Header (Desktop)
  - **Form fields:**
    - gewohnheit_name (text, required)
    - beschreibung (textarea, optional)
    - kategorie (select: Gesundheit & Fitness, Ernährung, Produktivität, Persönliche Entwicklung, Soziales, Finanzen, Sonstiges)
    - ziel_haeufigkeit (select: Täglich, Mehrmals pro Woche, Wöchentlich, Monatlich)
    - startdatum (date, default: heute)
    - zielwert (text, optional - z.B. "8 Gläser Wasser")
    - messbar (checkbox - wenn ja, erscheint Menge/Wert-Feld bei Einträgen)
  - **Form style:** Dialog/Modal
  - **Required fields:** gewohnheit_name, kategorie, ziel_haeufigkeit
  - **Default values:** startdatum = heute, messbar = false

- **Read (Anzeigen):**
  - **List view:** Cards mit Name, Kategorie-Badge, Häufigkeit
  - **Detail view:** Dialog mit allen Feldern + Statistik (wie oft erledigt, Streak)
  - **Fields shown in list:** Name, Kategorie, Häufigkeit
  - **Fields shown in detail:** Alle Felder + berechnete Stats
  - **Sort:** Alphabetisch nach Name
  - **Filter/Search:** Filter nach Kategorie möglich

- **Update (Bearbeiten):**
  - **Trigger:** Bearbeiten-Icon (Stift) bei jeder Gewohnheit, oder Detail-Dialog > Bearbeiten
  - **Edit style:** Gleicher Dialog wie Create, vorausgefüllt
  - **Editable fields:** Alle Felder

- **Delete (Löschen):**
  - **Trigger:** Löschen-Icon (Papierkorb), oder Swipe-Geste auf Mobile
  - **Confirmation:** Immer erforderlich!
  - **Confirmation text:** "Möchtest du die Gewohnheit '{name}' wirklich löschen? Alle zugehörigen Einträge bleiben erhalten."

**Tägliche Einträge CRUD Operations**

- **Create (Erstellen):**
  - **Trigger:** FAB (Mobile) oder "Eintrag hinzufügen" Button (Desktop), oder Checkbox-Toggle in Heute-Liste
  - **Form fields:**
    - gewohnheit (select aus Gewohnheiten-Liste, required)
    - datum (date, default: heute)
    - erledigt (checkbox, default: true)
    - menge (number, optional - nur wenn Gewohnheit messbar)
    - notizen (textarea, optional)
  - **Form style:** Dialog/Modal für manuelles Hinzufügen; Direktes Toggle für Quick-Add
  - **Required fields:** gewohnheit, datum
  - **Default values:** datum = heute, erledigt = true

- **Read (Anzeigen):**
  - **List view:** In "Heute" Sektion: Checkbox + Gewohnheitsname + optionale Menge
  - **Detail view:** Dialog mit allen Feldern
  - **Fields shown in list:** Gewohnheitsname (resolved), erledigt-Status, Menge
  - **Fields shown in detail:** Alle Felder inkl. Notizen
  - **Sort:** Nach Datum (neueste zuerst), dann nach Gewohnheit
  - **Filter/Search:** Gefiltert auf aktuelles Datum in Heute-Ansicht

- **Update (Bearbeiten):**
  - **Trigger:** Tap auf Eintrag in Heute-Liste, oder Bearbeiten-Icon
  - **Edit style:** Gleicher Dialog wie Create, vorausgefüllt
  - **Editable fields:** erledigt, menge, notizen (Gewohnheit und Datum nicht änderbar)

- **Delete (Löschen):**
  - **Trigger:** Swipe-Geste oder Löschen-Icon im Detail-Dialog
  - **Confirmation:** Immer erforderlich
  - **Confirmation text:** "Möchtest du diesen Eintrag wirklich löschen?"

**Tagesprotokoll CRUD Operations**

- **Create (Erstellen):**
  - **Trigger:** "Tagesnotiz hinzufügen" Link unter der Heute-Liste
  - **Form fields:**
    - protokoll_datum (date, required, default: heute)
    - erledigte_gewohnheiten (select aus Gewohnheiten, optional - zur Übersicht)
    - tagesnotizen (textarea, optional)
  - **Form style:** Dialog/Modal oder Inline-Textarea
  - **Required fields:** protokoll_datum
  - **Default values:** protokoll_datum = heute

- **Read (Anzeigen):**
  - **List view:** Am Ende der Heute-Sektion als kleiner Text-Block
  - **Detail view:** Expandierbare Ansicht oder Dialog
  - **Fields shown in list:** Datum, Vorschau der Notizen (gekürzt)
  - **Fields shown in detail:** Alle Felder
  - **Sort:** Nach Datum (neueste zuerst)
  - **Filter/Search:** Nach Datum filterbar

- **Update (Bearbeiten):**
  - **Trigger:** Tap auf Tagesnotiz oder Bearbeiten-Icon
  - **Edit style:** Gleicher Dialog wie Create, vorausgefüllt
  - **Editable fields:** tagesnotizen, erledigte_gewohnheiten

- **Delete (Löschen):**
  - **Trigger:** Löschen-Icon
  - **Confirmation:** Erforderlich
  - **Confirmation text:** "Möchtest du die Tagesnotiz vom {datum} wirklich löschen?"

---

## 7. Visual Details

### Border Radius
Rounded (8px) - Sanft gerundet für ein freundliches, einladendes Gefühl. Nicht zu pill-artig, nicht zu scharf.

### Shadows
Subtle - Sanfte Schatten (0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)) für Cards. Hover-State mit leicht erhöhtem Schatten.

### Spacing
Normal - 16px als Basis-Einheit. Cards haben 16px Padding, Abstand zwischen Elementen 12-16px.

### Animations
- **Page load:** Stagger - Elemente erscheinen nacheinander mit leichtem Fade+Translate
- **Hover effects:** Sanfter Schatten-Anstieg, Scale 1.02 für Cards
- **Tap feedback:** Scale 0.98 beim Drücken, dann zurück
- **Progress-Ring:** Animiert beim Laden und bei Änderungen (CSS transition)
- **Checkbox:** Check-Animation mit Scale und Color-Transition

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
:root {
  --background: hsl(45 30% 97%);
  --foreground: hsl(150 10% 15%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(150 10% 15%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(150 10% 15%);
  --primary: hsl(152 55% 40%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(45 20% 94%);
  --secondary-foreground: hsl(150 10% 25%);
  --muted: hsl(45 20% 94%);
  --muted-foreground: hsl(150 5% 45%);
  --accent: hsl(152 45% 92%);
  --accent-foreground: hsl(152 55% 25%);
  --destructive: hsl(0 65% 55%);
  --border: hsl(45 15% 88%);
  --input: hsl(45 15% 88%);
  --ring: hsl(152 55% 40%);
  --chart-1: hsl(152 55% 40%);
  --chart-2: hsl(152 45% 55%);
  --chart-3: hsl(45 50% 55%);
  --chart-4: hsl(200 50% 55%);
  --chart-5: hsl(280 40% 55%);
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from URL above (Plus Jakarta Sans)
- [ ] All CSS variables copied exactly
- [ ] Mobile layout matches Section 4
- [ ] Desktop layout matches Section 5
- [ ] Hero element (Progress-Ring) is prominent as described
- [ ] Colors create the warm, motivating mood described in Section 2
- [ ] CRUD patterns are consistent across all apps (same dialog style, button placement)
- [ ] Delete confirmations are in place for all delete operations
- [ ] Checkbox toggle creates/updates Tägliche Einträge automatically
- [ ] FAB positioned correctly on mobile
- [ ] Categories use correct lookup_data keys from app_metadata.json
