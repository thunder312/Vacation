# Benutzerhandbuch: Manager

## Übersicht

Als Manager haben Sie vollständige Kontrolle über das Urlaubsverwaltungssystem:
- Finale Genehmigung aller Urlaubsanträge
- Stornierung genehmigter Urlaube
- Mitarbeiterverwaltung
- Urlaubsregelungen definieren
- Jahreswechsel durchführen
- Berichte erstellen

---

## Ihre Tabs

| Tab | Beschreibung |
|-----|--------------|
| **Mein Antrag** | Eigene Urlaubsanträge |
| **Teamleiter** | Anträge von Mitarbeitern ohne Teamleiter |
| **Manager** | Finale Genehmigung & genehmigte Urlaube |
| **Urlaubsregelung** | Halbtags-Regeln verwalten |
| **Mitarbeiterverwaltung** | Benutzer anlegen und bearbeiten |
| **Organisation** | Organigramm und Team-Zuordnungen |
| **Berichte** | Jahresberichte erstellen |
| **Kalender** | Urlaubskalender aller Mitarbeiter |

---

## Tab "Manager"

### Offene Anträge zur Endgenehmigung

Hier sehen Sie Anträge mit Status:
- **Ausstehend** (von Office, Teamleitern, Admins - ohne Teamleiter-Stufe)
- **Teamleiter genehmigt** (vom Teamleiter bereits freigegeben)

```
┌─────────────────────────────────────────────────────────┐
│  Lisa Schmidt                          [TL genehmigt]   │
│  01.08.2026 - 15.08.2026 (11 Arbeitstage)              │
│  Teamleiter: Max Mustermann                             │
│  Genehmigt am: 15.06.2026                              │
│                                                         │
│  [✓ Genehmigen]  [✗ Ablehnen]                          │
└─────────────────────────────────────────────────────────┘
```

### Antrag final genehmigen

1. Prüfen Sie den Antrag
2. Klicken Sie auf **Genehmigen**
3. Der Urlaub ist jetzt bestätigt und im Kalender sichtbar

### Antrag ablehnen

1. Klicken Sie auf **Ablehnen**
2. Der Antrag wird abgelehnt (auch wenn Teamleiter bereits genehmigt hat)

---

## Genehmigte Urlaube verwalten

### Urlaub stornieren

Sie können genehmigte Urlaube stornieren (z.B. bei dringenden Projekten):

1. Scrollen Sie zum Bereich "Genehmigte Urlaube"
2. Finden Sie den zu stornierenden Urlaub
3. Klicken Sie auf **Stornieren**
4. Geben Sie einen **Grund** ein (Pflichtfeld)
5. Bestätigen Sie die Stornierung

> **Wichtig:** Der Mitarbeiter erhält seine Urlaubstage zurück. Der Grund wird dem Mitarbeiter angezeigt.

### PDF-Export

Klicken Sie auf **Ungenehmigte Urlaube exportieren**, um eine Liste aller ausstehenden Anträge zu erhalten.

---

## Tab "Urlaubsregelung"

### Halbtags-Regeln verwalten

Definieren Sie Tage, an denen nur ein halber Urlaubstag abgezogen wird:

| Typische Halbtage |
|-------------------|
| 24.12. - Heiligabend |
| 31.12. - Silvester |
| Regionale Feiertage |

### Regel hinzufügen

1. Klicken Sie auf **Regel hinzufügen**
2. Wählen Sie das **Datum**
3. Geben Sie eine **Beschreibung** ein
4. Klicken Sie auf **Speichern**

### Regel löschen

1. Finden Sie die Regel in der Liste
2. Klicken Sie auf **Löschen**
3. Bestätigen Sie die Löschung

---

## Tab "Mitarbeiterverwaltung"

### Neuen Mitarbeiter anlegen

1. Klicken Sie auf **Neuen Mitarbeiter anlegen**
2. Füllen Sie das Formular aus:
   - **Vorname** und **Nachname**
   - **Benutzername** (wird automatisch generiert)
   - **Rolle** (Mitarbeiter, Teamleiter, Manager, Office, Admin)
   - **Urlaubstage pro Jahr** (Standard: 30)
   - **Teamleiter** (für Mitarbeiter)
   - **Passwort** (wird generiert, kann geändert werden)
3. Klicken Sie auf **Speichern**

### Mitarbeiter bearbeiten

1. Suchen Sie den Mitarbeiter in der Liste
2. Klicken Sie auf **Bearbeiten**
3. Ändern Sie die gewünschten Felder
4. Klicken Sie auf **Speichern**

### Mitarbeiter deaktivieren

1. Klicken Sie auf **Deaktivieren** beim Mitarbeiter
2. Der Mitarbeiter kann sich nicht mehr anmelden
3. Seine Daten bleiben für Berichte erhalten

### Passwort zurücksetzen

1. Klicken Sie auf **Passwort zurücksetzen**
2. Ein neues Passwort wird generiert
3. Teilen Sie dem Mitarbeiter das neue Passwort mit

---

## Jahreswechsel durchführen

### Wann durchführen?

Der Jahreswechsel sollte **Anfang Januar** durchgeführt werden, wenn alle Urlaube des Vorjahres eingetragen sind.

### Ablauf

1. Öffnen Sie den Tab **Manager**
2. Klappen Sie den Bereich **Jahreswechsel** auf
3. Klicken Sie auf **Vorschau anzeigen**
4. Prüfen Sie die berechneten Übertragstage:

```
┌────────────────────────────────────────────────────────────────────┐
│  Mitarbeiter     │ Anspruch │ Genommen │ Rest │ Berechnet │ Angepasst │
│  ────────────────────────────────────────────────────────────────  │
│  Max Mustermann  │    30    │    25    │   5  │     5     │    5      │
│  Lisa Schmidt    │    30    │    28    │   2  │     2     │    2      │
└────────────────────────────────────────────────────────────────────┘
```

5. **Optional:** Passen Sie einzelne Werte an und geben Sie einen Grund ein
6. Geben Sie einen **gemeinsamen Grund** für alle ein (z.B. "Jahreswechsel 2025 → 2026")
7. Klicken Sie auf **Jahreswechsel durchführen**

### Halbtage übertragen

Im gleichen Dialog können Sie auch Halbtags-Regeln ins neue Jahr übertragen:
- Aktivieren Sie die Checkbox bei den gewünschten Regeln
- Bereits existierende Regeln werden übersprungen

### Jahreswechsel zurücksetzen

Falls ein Fehler passiert ist:
1. Klicken Sie auf **Jahreswechsel zurücksetzen**
2. Bestätigen Sie die Aktion
3. Die Übertragsdaten und neuen Halbtage werden gelöscht

---

## Tab "Berichte"

### Jahresbericht erstellen

1. Wählen Sie das **Jahr**
2. Prüfen Sie die Vorschau:
   - Gesamtstatistik
   - Anzahl Mitarbeiter
   - Durchschnittliche Urlaubstage
3. Klicken Sie auf **Jahresbericht als PDF erstellen**

Das PDF enthält:
- Seite 1: Gesamtübersicht
- Ab Seite 2: Einzelne Mitarbeiter-Blätter mit Unterschriftsfeld

---

## Tab "Organisation"

### Organigramm

Hier sehen Sie die Organisationsstruktur mit Team-Zuordnungen.

### Team-Zuordnung ändern

1. Klicken Sie auf einen Mitarbeiter
2. Wählen Sie den neuen Teamleiter
3. Die Änderung wird sofort wirksam

### PDF-Export

Klicken Sie auf **Organigramm als PDF exportieren** für eine druckbare Version.

---

## Workflow-Übersicht

```
┌─────────────────────────────────────────────────────────┐
│                    ANTRAGSTELLUNG                       │
│                          ↓                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Hat Mitarbeiter einen Teamleiter?              │   │
│  └─────────────────────────────────────────────────┘   │
│           ↓ JA                    ↓ NEIN               │
│  ┌─────────────────┐    ┌─────────────────────────┐   │
│  │  Teamleiter     │    │  Direkt zu Manager      │   │
│  │  genehmigt      │    │                         │   │
│  └────────┬────────┘    └───────────┬─────────────┘   │
│           ↓                         ↓                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │           MANAGER GENEHMIGT FINAL               │   │
│  └─────────────────────────────────────────────────┘   │
│                          ↓                              │
│                 URLAUB BESTÄTIGT                        │
└─────────────────────────────────────────────────────────┘
```

---

## Tipps für Manager

1. **Regelmäßig prüfen:** Schauen Sie täglich nach neuen Anträgen
2. **Kalender nutzen:** Prüfen Sie Überschneidungen im Kalender
3. **Jahreswechsel planen:** Führen Sie ihn zeitnah im Januar durch
4. **Halbtage pflegen:** Aktualisieren Sie die Regeln jährlich
5. **Berichte archivieren:** Erstellen Sie Jahresberichte für die Dokumentation

---

*Letzte Aktualisierung: Januar 2026*
