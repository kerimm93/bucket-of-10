# Bucket of Ten — Designphilosophie-Alignment

## Gesamtübersicht

Dieser Schritt bringt die App näher an die Designphilosophie v2:
> Kontext ist Material. Fokus ist Verbindlichkeit.

Keine neuen Features, keine Datenstrukturveränderungen — ausschließlich
UX-Korrekturen und Microcopy-Anpassungen.

---

## 1. Kritischer Keyboard-Fix

### Problem
`Shift+Enter` wurde für „vorherige Zeile" verwendet.
Die Philosophie sagt explizit: **Shift+Enter darf nicht für Navigation
verwendet werden**, weil es als weicher Zeilenumbruch in Schreibprogrammen
gelernt ist. Das erzeugt Reibung beim Tippen.

### Fix
| Aktion | Alt | Neu |
|---|---|---|
| Vorherige Zeile | `Shift+Enter` | `Alt+Enter` |
| Nächste Zeile | `Enter` | `Enter` (unverändert) |
| Details auf/zu | `Ctrl/Cmd+Enter` | `Ctrl/Cmd+Enter` (unverändert) |
| Fokus verlassen | `Escape` | `Escape` (unverändert) |

**Betroffene Funktion:** `handleBucketTitleKeydown()`

---

## 2. App-Subtitle

**Alt:**
> Kontext ist Material. Fokus ist Verbindlichkeit. Die Zehn sind die einzige echte Aufgabenliste.

**Neu:**
> Dringendes füllt selten alle zehn Plätze. Der Rest ist dein Wachstumsraum. Kontext ist Material — Fokus ist Verbindlichkeit.

**Warum:** Die neue Formulierung benennt das Kernversprechen der Methode sofort:
die Lücke zwischen Pflicht und zehn Plätzen ist der Entwicklungsraum.

---

## 3. Projekte-Tab

**Alt:**
> Projekte sind Kontext- und Auswahlmaterial für die Bucket of Ten — keine zweite Aufgabenliste.

**Neu:**
> Projekte speichern Kontext. Die Bucket entscheidet Fokus. Kein zweites Todo-System — Projekte halten Anknüpfungspunkte, Material und offene Fäden.

**Warum:** Die Leitformel „Projekte speichern Kontext. Die Bucket entscheidet Fokus."
ist direkter und prägt sich ein.

---

## 4. Projekt-Detail: nextStep-Feld

**Kompass-Label:** `↗ Kompass / Nächste Richtung — kein Todo, kein Termin`

**Alt-Hinweis:**
> Dieser Hinweis ist Orientierung, nicht Verpflichtung. Er wird nicht zur Bucket unless du es entscheidest.

**Neu:**
> Next Step ist ein Kompass, keine Aufgabe. Wenn dieser Hinweis verbindlich werden soll, erzeuge daraus einen Kandidaten und übernimm ihn bewusst in die Bucket.

**Warum:** Die Leitformel „Next Step ist ein Kompass, keine Aufgabe" wird hier direkt
sichtbar. Der Weg (Kandidat → Bucket) wird explizit benannt.

---

## 5. Reset / Review-Tab

**Meta-Beschreibung alt:**
> Vom diffusen Material zur bewussten Auswahl. Erst Spiegelung, dann Reduktion, dann Kandidaten.

**Neu:**
> Rohmaterial → Analyse → Kandidaten → bewusste Auswahl → Bucket. Diese Woche soll nicht nur voller, sondern klarer werden.

**Rohmaterial-Abschnitt:** Zusätzlicher Hinweis ergänzt:
> Alles rein: Weekly Review, Braindump, Journaling, Sprachnotizen. Noch keine Priorisierung.

**Verdichtungs-Abschnitt:** Zusätzlicher Hinweis ergänzt:
> Nicht der KI überlassen: Was zieht wirklich? Was ist nur Beschäftigung? Was kehrt immer wieder zurück?

**Button:** `Verdichtung als Kandidat übernehmen` → `Als Kandidat vormerken`

---

## 6. Kandidaten-Bereich

**Abschnittshinweis hinzugefügt:**
> Vorschläge, keine Verpflichtungen. Erst wenn du sie bewusst überimmst, werden sie zur Bucket.

**Button-Labels:**

| Alt | Neu |
|---|---|
| `in Bucket` | `Bewusst übernehmen` |
| `löschen` | `verwerfen` |

**Warum:** Der Übernahme-Akt soll als bewusste Handlung erfahrbar sein,
nicht als einfaches Verschieben. `verwerfen` ist aktiver als `löschen`.

---

## 7. Prompt Studio

**Alt:**
> Hier erzeugst du Prompts, kopierst Antworten zurück und importierst bereinigtes JSON.

**Neu:**
> KI ist Spiegel und Verdichter, nicht Entscheider. Prompt erzeugen → Antwort zurückbringen → Kandidaten filtern → Bucket selbst formulieren.

**Warum:** Der Fluss und die Rollenverteilung (KI vorbereitet, Mensch entscheidet)
wird explizit.

---

## 8. V1-Hinweis-Panel

**Alt:**
> V1 soll noch nicht dein komplettes Second Brain nachbauen. Sie soll zuerst das Kernprinzip sauber verkörpern: Kontext sammeln, Review ermöglichen, Bucket formulieren.

**Neu:**
> Kontext darf ruhen. Fokus wird gewählt. Diese App soll eine Woche nicht nur verwalten, sondern bewusst formen.

---

## 9. Confirm-Dialoge

| Dialog | Alt | Neu |
|---|---|---|
| Neue Woche | „Neue Woche anlegen? Die aktuelle Bucket bleibt im Verlauf erhalten." | „Neue Woche beginnen? Die aktuelle Bucket wird im Verlauf gespeichert und kann jederzeit wieder geöffnet werden." |
| Liste leeren | „Aktuelle Bucket wirklich leeren?" | „Alle zehn Zeilen leeren? Diese Woche beginnt dann neu." |
| Bucket voll | „Die aktuelle Bucket of Ten ist bereits voll." | „Alle zehn Plätze sind bereits belegt. Leere zuerst einen Platz." |

---

## Was nicht geändert wurde

- Datenstruktur (alle Felder unverändert)
- Visuelles Design (Legal-Pad-Optik unverändert)
- Projektbereich-Struktur
- Export/Import
- Paste-Splitting-Logik
- saveSilent-Logik
- Keine neuen Features
