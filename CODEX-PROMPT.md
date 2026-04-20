# Bucket of Ten — Codex Refactoring Prompt

## Deine Rolle

Du bist ein erfahrener Frontend-Architekt und UX-Engineer.

Du refaktorierst eine bestehende Single-File-HTML-App in eine saubere,
modulare Webanwendung — ohne das Kernprinzip, die Designphilosophie
und die bestehenden Features zu verändern.

---

## 1. Ausgangslage

Die App existiert als vollständige Single-File-HTML-Datei mit Vanilla JS
und localStorage. Sie funktioniert vollständig. Das Repository enthält
diese Datei sowie Dokumentation.

Die App heißt **Bucket of Ten** und basiert auf dieser Kernformel:

> Kontext ist Material. Fokus ist Verbindlichkeit.

Jede Woche werden genau zehn Aufgaben ausgewählt. Die App ist kein
klassischer Task-Manager, kein Kanban-Board, kein Jira. Sie ist eine
wöchentliche Fokus- und Wachstumsmethode.

---

## 2. Designphilosophie (bindend für alle Entscheidungen)

### Kernprinzipien

- Die Bucket of Ten ist die einzige echte Aufgabenliste.
- Projekte sind Kontextspeicher, keine zweiten Aufgabenlisten.
- Kandidaten sind Vorschläge, keine Verpflichtungen.
- KI ist Spiegel und Verdichter, nicht Entscheider.
- Next Step in Projekten ist ein Kompass, keine Aufgabe.
- Die finale Bucket-Formulierung bleibt eine bewusste Nutzerhandlung.

### Fokusbereich-Prinzipien (nicht verhandelbar)

Der Fokusbereich muss wirken wie eine getippte Liste auf einem Legal Pad:

- Genau zehn Zeilen.
- Warmer Papierhintergrund, subtile horizontale Linien.
- Dezente rote Marginallinie links.
- Inputs wirken wie Text auf Papier, keine sichtbaren Formularboxen.
- Keine Karten pro Item.
- Keine Dashboard-Statistiken.
- Keine permanente rechte Spalte im Fokusmodus.
- Details als eingerückter Notizbereich.
- Controls nur bei Hover/Fokus sichtbar.

### Keyboard-Regeln (nicht verhandelbar)

- `Enter` → nächste Bucket-Zeile
- `Alt+Enter` → vorherige Bucket-Zeile
- `Ctrl+Enter` / `Cmd+Enter` → Details auf/zuklappen
- `Shift+Enter` → NICHT für Navigation (weicher Zeilenumbruch)
- `Escape` → Details schließen oder Fokus verlassen
- Mehrzeiliger Paste → automatisch auf Folgezeilen verteilen
- Bullet-Zeichen beim Paste automatisch entfernen
- Kein Fokusverlust beim Tippen

---

## 3. Datenmodell

### BucketWeek
```typescript
interface BucketWeek {
  id: string;
  label: string;
  createdAt: string;
  items: BucketItem[];
}
```

### BucketItem
```typescript
interface BucketItem {
  id: string;
  index: number;          // 1–10
  title: string;
  done: boolean;
  open: boolean;          // Details aufgeklappt
  type: 'pflicht' | 'pflege' | 'wachstum' | 'kreativ';
  projectId: string;      // Referenz auf Project.id
  projectRef: string;     // Fallback-Text wenn kein projectId
  details: string;        // Markdown
  notes: string;          // Legacy-Feld, kompatibel halten
}
```

### Project
```typescript
interface Project {
  id: string;
  title: string;
  status: 'aktiv' | 'pausiert' | 'archiviert';
  summary: string;
  currentFocus: string;
  nextStep: string;       // Kompass, keine Aufgabe
  mainChatUrl: string;
  driveUrl: string;
  obsidianUrl: string;
  lastAnalysis: string;
  createdAt: string;
  updatedAt: string;
  // Legacy (kompatibel halten):
  link?: string;
  notes?: string;
}
```

### Resource
```typescript
interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'gpt' | 'obsidian' | 'doc' | 'reader' | 'zotero' | 'raindrop' | 'other';
  projectRef: string;
  reason: string;
  createdAt: string;
}
```

### CandidateStep
```typescript
interface CandidateStep {
  id: string;
  title: string;
  projectId: string;
  projectRef: string;
  whyNow: string;
  type: 'pflicht' | 'pflege' | 'wachstum' | 'kreativ' | 'offen';
  createdAt: string;
}
```

### AppState
```typescript
interface AppState {
  projects: Project[];
  resources: Resource[];
  candidateSteps: CandidateStep[];
  bucketWeeks: BucketWeek[];
  currentWeekId: string;
  promptDrafts: {
    review: string;
    deep: string;
    cleanup: string;
  };
}
```

### Migration

Beim Laden aus localStorage muss `normalizeProject(p)` aufgerufen werden:
- `summary` aus `notes` vorbelegen wenn leer
- `obsidianUrl` aus `link` wenn `link` mit `obsidian://` beginnt
- `status` default `'aktiv'`
- `updatedAt` default `createdAt`
- Alle anderen neuen Felder auf `''` defaulten

---

## 4. Tech-Stack-Empfehlung

### Option A (empfohlen): Vite + React + TypeScript

```
Vite (Build Tool)
React 18 (UI)
TypeScript (Types)
Zustand (State Management) — leichtgewichtig, kein Redux-Overhead
CSS Modules oder vanilla CSS (kein Tailwind — zu viel visuelle Übersteuerung)
```

Kein Backend. Alles localStorage.
Kein Auth. Keine externe API außer Claude-Integration (optional).

### Option B: Vite + Svelte + TypeScript

Svelte ist leichter und reaktiver für diesen Use Case.
Wenn du Svelte kennst: bevorzuge es.

### Option C: Vite + Vanilla TS

Wenn kein Framework gewünscht — Vanilla TS mit DOM-Utilities.
Weniger ergonomisch, aber maximal kontrollierbar.

---

## 5. Projektstruktur (für Option A: React)

```
/src
  /components
    /focus
      BucketList.tsx          # Die Zehner-Papier-Liste
      BucketItem.tsx          # Eine Zeile
      BucketDetail.tsx        # Aufklappbarer Notizbereich
      PaperSurface.tsx        # Der Paper-Container
      FocusTopbar.tsx         # Wochenlabel + Stats + Optionen-Toggle
      FocusOptionsPanel.tsx   # Neue Woche, Liste leeren
      FocusHistoryPanel.tsx   # Kollabierbler Verlauf
    /projects
      ProjectsLayout.tsx      # Zwei-Spalten-Layout
      ProjectList.tsx         # Sidebar mit Projektliste
      ProjectItem.tsx         # Ein Projekt in der Sidebar
      ProjectDetail.tsx       # Detailansicht / Edit-Form
      ProjectForm.tsx         # Neues Projekt anlegen
      NextStepCompass.tsx     # Das Kompassfeld
    /review
      ReviewPanel.tsx
      CandidateList.tsx
      CandidateCard.tsx
    /studio
      PromptStudio.tsx
    /shared
      Tabs.tsx
      Topbar.tsx
      HistoryPanel.tsx
      ResourceList.tsx
  /hooks
    useBucket.ts              # Bucket-Operationen
    useProjects.ts            # Projekt-Operationen
    useCandidates.ts          # Kandidaten-Operationen
    useKeyboard.ts            # Keyboard-Handler
    usePasteSplit.ts          # Paste-Splitting-Logik
    useStorage.ts             # localStorage Persistenz
  /store
    appStore.ts               # Zustand Store
    migrations.ts             # normalizeProject, normalizeBucketItem
  /types
    index.ts                  # Alle Interfaces
  /styles
    tokens.css                # CSS Custom Properties
    paper.css                 # Legal-Pad-Optik
    dark.css                  # Dark App Chrome
    components.css            # Shared Component Styles
  /utils
    markdown.ts               # Minimal-Markdown-Renderer
    uid.ts
    date.ts
    export.ts                 # Export/Import JSON
  App.tsx
  main.tsx
```

---

## 6. CSS Design System

### Tokens (exakt aus dem Prototyp übernehmen)

```css
:root {
  /* App Chrome (dunkel) */
  --bg: #111110;
  --bg-mid: #161614;
  --surface: #1c1c1a;
  --surface-2: #222220;
  --surface-3: #2a2a27;
  --border: #2c2c29;
  --border-mid: #3a3a36;
  --ink: #e6e4dc;
  --ink-mid: #9a9890;
  --ink-dim: #4e4c46;
  --accent: #c4b48e;
  --green: #6a9870;
  --green-bg: rgba(106,152,112,0.10);
  --red: #9e5a52;
  --blue: #6282a0;
  --blue-bg: rgba(98,130,160,0.10);
  --orange: #b07848;
  --shadow: 0 10px 30px rgba(0,0,0,0.28);

  /* Paper Surface (warm, hell) */
  --paper-bg: #f8f6e8;
  --paper-line: rgba(155,170,210,0.18);
  --paper-margin: rgba(196,75,65,0.18);
  --paper-ink: #26231a;
  --paper-ink-mid: rgba(80,70,50,0.55);
  --paper-ink-dim: rgba(120,100,65,0.35);
  --paper-accent: rgba(100,82,52,0.18);
}
```

### Paper Surface CSS

```css
.paper-surface {
  background: var(--paper-bg);
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 43px,
    var(--paper-line) 43px,
    var(--paper-line) 44px
  );
  border-radius: 6px;
  position: relative;
  padding: 4px 16px 12px 50px;
  box-shadow: 0 2px 14px rgba(0,0,0,0.22), 0 1px 4px rgba(0,0,0,0.1);
}

.paper-surface::before {
  content: '';
  position: absolute;
  left: 38px; top: 0; bottom: 0;
  width: 1.5px;
  background: var(--paper-margin);
  pointer-events: none;
}
```

### Bucket Item Row

```css
.paper-item {
  position: relative;
  min-height: 44px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.paper-input {
  flex: 1;
  background: transparent;
  border: none;
  border-bottom: 1.5px solid transparent;
  color: var(--paper-ink);
  font-size: 0.96rem;
  height: 44px;
  outline: none;
  transition: border-bottom-color 0.15s;
}

.paper-input:focus {
  border-bottom-color: var(--paper-accent);
}

/* Controls nur bei Hover/Fokus */
.paper-row-controls {
  opacity: 0;
  transition: opacity 0.15s;
}
.paper-item:hover .paper-row-controls,
.paper-item:focus-within .paper-row-controls,
.paper-item.is-open .paper-row-controls {
  opacity: 1;
}
```

---

## 7. State Management (Zustand)

```typescript
// store/appStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppStore extends AppState {
  // Bucket Actions
  updateBucketTitle: (itemId: string, title: string) => void;
  toggleBucketDone: (itemId: string) => void;
  toggleBucketOpen: (itemId: string) => void;
  updateBucketType: (itemId: string, type: string) => void;
  updateBucketDetails: (itemId: string, details: string) => void;
  updateBucketProjectId: (itemId: string, projectId: string) => void;
  pasteLinesIntoBucket: (startIndex: number, lines: string[]) => void;
  startNewWeek: () => void;
  clearCurrentBucket: () => void;
  openWeek: (weekId: string) => void;

  // Project Actions
  addProject: (data: Partial<Project>) => void;
  updateProject: (id: string, field: string, value: string) => void;
  deleteProject: (id: string) => void;

  // Candidate Actions
  addCandidate: (data: Partial<CandidateStep>) => void;
  moveCandidateToBucket: (candidateId: string) => void;
  deleteCandidate: (id: string) => void;

  // Resource Actions
  addResource: (data: Partial<Resource>) => void;

  // Export/Import
  exportData: () => void;
  importData: (json: string) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // ... implementation
    }),
    {
      name: 'bucket_of_ten_v1', // exakt dieser Key — Kompatibilität mit alten Daten
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.projects = state.projects.map(normalizeProject);
          // weitere Migrationen
        }
      }
    }
  )
);
```

**Wichtig:** Der localStorage-Key muss `bucket_of_ten_v1` bleiben
für Rückwärtskompatibilität mit der HTML-Version.

---

## 8. Keyboard Hook

```typescript
// hooks/useKeyboard.ts
export function useBucketKeyboard(itemId: string, index: number) {
  const toggleBucketOpen = useAppStore(s => s.toggleBucketOpen);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Enter → nächste Zeile
    if (e.key === 'Enter' && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      focusBucketInput(index + 1);
      return;
    }
    // Alt+Enter → vorherige Zeile
    if (e.key === 'Enter' && e.altKey) {
      e.preventDefault();
      focusBucketInput(index - 1);
      return;
    }
    // Ctrl/Cmd+Enter → Details togglen
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      toggleBucketOpen(itemId);
      return;
    }
    // Escape → blur / Details schließen
    if (e.key === 'Escape') {
      e.preventDefault();
      (e.target as HTMLElement).blur();
      return;
    }
  }, [itemId, index, toggleBucketOpen]);

  return { handleKeyDown };
}

function focusBucketInput(index: number) {
  const el = document.querySelector<HTMLInputElement>(
    `[data-bucket-index="${index}"]`
  );
  if (el) {
    el.focus();
    const len = el.value.length;
    el.setSelectionRange(len, len);
  }
}
```

---

## 9. Paste-Splitting Hook

```typescript
// hooks/usePasteSplit.ts
export function usePasteSplit(itemId: string, index: number) {
  const pasteLinesIntoBucket = useAppStore(s => s.pasteLinesIntoBucket);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const text = e.clipboardData?.getData('text') ?? '';
    const lines = text
      .split('\n')
      .map(cleanLine)
      .filter(l => l.length > 0);

    if (lines.length <= 1) return; // nativer Paste

    e.preventDefault();
    pasteLinesIntoBucket(index, lines);
    // Fokus nach Render auf letzte Zeile
    setTimeout(() => focusBucketInput(index + lines.length - 1), 30);
  }, [index, pasteLinesIntoBucket]);

  return { handlePaste };
}

function cleanLine(line: string): string {
  return line
    .replace(/^[-*]\s+/, '')
    .replace(/^\d+[.)]\s+/, '')
    .trim();
}
```

---

## 10. Routing

Keine externe Router-Library nötig. Tab-State per URL-Hash:

```
/#focus        → Fokus-Tab
/#projects     → Projekte-Tab
/#review       → Reset / Review
/#studio       → Prompt Studio
```

Beim ersten Laden default: `/#focus`.

---

## 11. Fokus-Tab Layout

```
┌─────────────────────────────────────────┐
│ focus-week-label           3/8  ⋯       │  ← FocusTopbar
├─────────────────────────────────────────┤
│ [options panel: hidden by default]      │  ← FocusOptionsPanel
├─────────────────────────────────────────┤
│                                         │
│  ┆  1  □  Aufgabe A                ▼   │
│  ┆  2  □  Aufgabe B                ▼   │  ← PaperSurface
│  ┆  3  □  ···                      ▼   │
│  ┆  4  □                               │
│  ┆  ...                                │
│  ┆  10 □                               │
│                                   3/10  │
├─────────────────────────────────────────┤
│ ▸ Wochenverlauf                         │  ← FocusHistoryPanel
└─────────────────────────────────────────┘
```

Die rechte Spalte (History + V1-Hinweis) ist im Fokus-Tab NICHT sichtbar.
Nur in den anderen Tabs erscheint sie optional.

---

## 12. Projekte-Tab Layout

```
┌──────────────────┬──────────────────────┐
│ PROJEKTE    +Neu │  Projektdetail        │
│                  │                       │
│ ● Projekt A      │  Titel                │
│   aktiv · 2 🪣   │  Status               │
│   Summary...     │  Zusammenfassung      │
│                  │  Aktueller Fokus      │
│ ● Projekt B      │  ↗ Kompass/nextStep   │
│   aktiv          │  Links: Chat/Drive/   │
│                  │       Obsidian        │
│ ─ Pausiert ─     │  Letzte Analyse       │
│ ○ Projekt C      │                       │
└──────────────────┴──────────────────────┘
```

---

## 13. Was exakt erhalten bleiben muss

### Funktionen (vollständig reimplementieren)

- `startNewWeek()` mit Bestätigungsdialog
- `clearCurrentBucket()` mit Bestätigungsdialog
- `openWeek(id)` — ältere Wochen öffnen
- `addProject()` / `updateProjectField()` / `deleteProject()`
- `candidateFromProject(projectId)` — Kandidat aus Projektkontext
- `moveCandidateToBucket(id)` — bewusste Übernahme
- `buildReviewPrompt()` / `buildDeepPrompt()` / `buildCleanupPrompt()`
- `importStructuredJson()` — JSON mit `candidate_steps` Array
- `exportData()` / `importData()` — vollständiger State als JSON
- `fillDemoData()` — Demo-Daten für Onboarding
- `renderMarkdown()` — minimaler Markdown-Renderer (keine externe Lib)

### Microcopy (exakt beibehalten)

- „Dringendes füllt selten alle zehn Plätze. Der Rest ist dein Wachstumsraum."
- „Projekte speichern Kontext. Die Bucket entscheidet Fokus."
- „Kandidaten sind Vorschläge, keine Verpflichtungen."
- „Next Step ist ein Kompass, keine Aufgabe."
- „KI ist Spiegel und Verdichter, nicht Entscheider."
- „Bewusst übernehmen" (Kandidat → Bucket)
- „Kontext darf ruhen. Fokus wird gewählt."

### localStorage-Key

`bucket_of_ten_v1` — exakt so, für Kompatibilität.

---

## 14. Was verbessert werden soll

### Performance

- `saveSilent` beim Tippen: State-Update ohne Re-Render der gesamten Liste.
  Nur das betroffene Input darf seinen eigenen State halten (controlled/uncontrolled Mix).
- Debounced Storage-Write (300ms) beim Tippen.
- Kein Full-Rerender beim Öffnen/Schließen von Details.

### UX Improvements

- **Fokuswiederherstellung nach Paste**: Nach Paste-Splitting muss der Fokus
  auf dem letzten befüllten Input sitzen, Cursor am Ende.
- **Smooth Detail-Animation**: Details sollen nicht hart ein-/ausblenden,
  sondern mit einer `max-height`-Transition (~150ms) animiert werden.
- **Project-Hint in Bucket-Zeile**: Wenn ein Item einem Projekt zugewiesen ist,
  zeige einen kleinen Chip nur wenn die Zeile fokussiert ist oder aufgeklappt.
- **Wachstumsraum-Indikator**: Optional: Wenn ≤ 4 Items befüllt sind,
  zeige einen sehr dezenten Hinweis „6 freie Plätze — dein Wachstumsraum".
- **Empty State**: Leere Bucket sollte einen einladenden Starthinweis zeigen,
  nicht eine leere Formular-Seite.
- **Mobile**: Touch-Targets mindestens 44px. Paper-Surface soll auf Mobile
  ohne horizontales Scrollen funktionieren.

### Code Quality

- TypeScript strict mode.
- Alle Render-Funktionen als reine React-Komponenten.
- State-Mutations nur über den Store.
- Keine innerHTML-Strings mehr (war notwendig in Vanilla JS, nicht in React).
- Alle Event-Handler mit `useCallback` memoized.
- `normalizeProject` und `normalizeBucketItem` als pure functions in `/utils/migrations.ts`.

---

## 15. Was NICHT gebaut werden soll

- Kein Kanban
- Kein Trello
- Kein Jira
- Keine Feature-Datenbank
- Kein Gist-Sync
- Keine Roadtrip-Reconciliation
- Keine WorkChats (noch nicht)
- Keine projectStrands / Baustellen (noch nicht)
- Kein komplettes Settings-System
- Kein Backend / keine externe API (außer optionale Claude-Integration)
- Keine Auth
- Kein Multi-User

---

## 16. Optionale Claude-Integration

Die HTML-Version hat ein Prompt Studio, das Prompts generiert, die der
Nutzer manuell in ChatGPT/Claude kopiert.

In der App-Version kann das direkt integriert werden:

```typescript
// Optional: Direktaufruf über claude API
const response = await window.claude?.complete({
  messages: [{ role: 'user', content: prompt }]
});
```

Aber das ist **optional und darf die Core-UX nicht blockieren**.
Das Prompt Studio soll weiterhin ohne API-Key funktionieren.

---

## 17. Deployment

- **Vite** baut in `/dist`
- Deploy auf **GitHub Pages**, **Netlify** oder **Vercel**
- Keine Server-Logik nötig — reine Static App
- Optional: PWA-Manifest für Add-to-Homescreen

---

## 18. Priorisierung

### Must-have (v1.0)

1. Fokus-Tab als Legal-Pad-Schreibfläche (exakt wie im Prototyp)
2. Keyboard-Navigation (Enter, Alt+Enter, Ctrl+Enter, Escape)
3. Paste-Splitting
4. Projekte-Tab mit Detailansicht
5. Kandidaten / Review
6. Prompt Studio
7. Export / Import JSON
8. localStorage-Persistenz

### Should-have (v1.1)

1. Detail-Animation (max-height transition)
2. Wachstumsraum-Indikator
3. PWA-Manifest
4. Besserer Mobile-Support

### Nice-to-have (v2.0)

1. Direkte Claude-API-Integration
2. WorkChats pro Projekt
3. Kalenderkontext
4. Commit-Logik (Entwurf → offizielle Bucket)

---

## 19. Qualitätskriterien

Die fertige App muss diese Kriterien erfüllen:

- [ ] `Enter` im Bucket-Input springt zur nächsten Zeile ohne Fokusverlust
- [ ] `Alt+Enter` springt zur vorherigen Zeile
- [ ] `Ctrl+Enter` klappt Details auf/zu ohne Fokusverlust
- [ ] Paste von 5 Zeilen befüllt 5 Bucket-Items ab der aktuellen Position
- [ ] Kein Full-Rerender beim Tippen im Bucket-Input
- [ ] Altes localStorage (`bucket_of_ten_v1`) wird korrekt migriert
- [ ] Export erzeugt valides JSON, Import lädt es korrekt
- [ ] Projekte sortiert: aktiv → pausiert → archiviert
- [ ] nextStep-Feld ist visuell klar als Kompass/Kontext markiert, nicht als Checkbox
- [ ] Fokus-Tab zeigt KEINE rechte Spalte
- [ ] Details-Bereich ist dezent und macht die Hauptliste nicht schwer
- [ ] Paper-Surface hat warmen Hintergrund, Linien und Marginallinie
- [ ] App funktioniert auf Mobile (320px–480px)

---

## 20. Startbefehl für Codex

```
Refaktoriere das bestehende Single-File HTML (index.html) in eine
Vite + React + TypeScript App entsprechend dieser Spezifikation.

Beginne mit:
1. Vite-Projekt-Setup mit React + TypeScript
2. CSS Token-Datei aus dem Prototyp extrahieren
3. Zustand Store mit Typen und Migrationen
4. BucketList + BucketItem Komponenten als Legal-Pad-Surface
5. Keyboard Hook und Paste Hook

Halte dich dabei exakt an:
- Die CSS-Tokens aus Abschnitt 6
- Das Datenmodell aus Abschnitt 3
- Die Keyboard-Regeln aus Abschnitt 2
- Den localStorage-Key `bucket_of_ten_v1`

Der erste Schritt ist der Fokus-Tab. Alles andere danach.
```
