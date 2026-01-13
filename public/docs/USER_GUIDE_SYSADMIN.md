# Benutzerhandbuch: System Administrator

## Übersicht

Als System Administrator haben Sie Zugriff auf technische Verwaltungsfunktionen:
- Datenbank-Backup erstellen und herunterladen
- Datenbank zurücksetzen (Vorsicht!)
- Benutzer-Import aus Excel
- Keine Urlaubsverwaltungsfunktionen (nur technische Administration)

---

## Ihre Tabs

| Tab | Beschreibung |
|-----|--------------|
| **Datenbank** | Backup, Import und Reset-Funktionen |

> **Hinweis:** Der Admin-Account hat standardmäßig keinen Zugriff auf Urlaubsfunktionen. Er dient nur der technischen Verwaltung.

---

## Tab "Datenbank"

### Bereich 1: Datenbank-Backup

#### Backup erstellen

1. Klicken Sie auf **Backup erstellen**
2. Warten Sie, bis das Backup erstellt wurde
3. Eine Erfolgsmeldung erscheint

#### Backup herunterladen

1. Klicken Sie auf **Letztes Backup herunterladen**
2. Die JSON-Datei wird heruntergeladen
3. Speichern Sie die Datei sicher ab

**Backup-Inhalt:**
```json
{
  "timestamp": "2026-01-09T10:30:00.000Z",
  "tables": {
    "users": [...],
    "vacation_requests": [...],
    "organization": [...],
    "carryover": [...],
    "half_day_rules": [...],
    "vacation_exceptions": [...]
  }
}
```

#### Empfohlene Backup-Strategie

| Häufigkeit | Aktion |
|------------|--------|
| Täglich | Automatisches Backup (falls konfiguriert) |
| Wöchentlich | Manuelles Backup herunterladen |
| Vor Updates | Immer ein Backup erstellen |
| Nach Jahreswechsel | Backup zur Archivierung |

---

### Bereich 2: Datenbank zurücksetzen

> **WARNUNG:** Diese Funktion löscht ALLE Daten außer dem Admin-Benutzer!

#### Wann verwenden?

- Testsystem zurücksetzen
- Neuinstallation vorbereiten
- Nach schwerwiegenden Datenfehlern

#### Ablauf

1. Aktivieren Sie die Checkbox: **"Ich verstehe, dass alle Daten gelöscht werden"**
2. Klicken Sie auf **Datenbank jetzt zurücksetzen**
3. Bestätigen Sie die Sicherheitsabfrage
4. Alle Daten werden gelöscht

**Was wird gelöscht:**
- Alle Benutzer (außer admin)
- Alle Urlaubsanträge
- Alle Organisationsdaten
- Alle Carryover-Einträge
- Alle Halbtags-Regeln
- Alle Vacation-Exceptions

**Was bleibt erhalten:**
- Admin-Benutzer
- Datenbankstruktur

---

### Bereich 3: Benutzer-Import

#### Excel-Vorlage herunterladen

1. Klicken Sie auf **Excel-Vorlage herunterladen**
2. Öffnen Sie die Datei in Excel

**Spalten der Vorlage:**

| Spalte | Beschreibung | Pflicht |
|--------|--------------|---------|
| username | Benutzername | Ja |
| firstName | Vorname | Ja |
| lastName | Nachname | Ja |
| role | Rolle (employee/teamlead/manager/office) | Ja |
| vacationDays | Urlaubstage pro Jahr | Ja |
| teamleadUsername | Benutzername des Teamleiters | Nein |

**Beispiel:**

| username | firstName | lastName | role | vacationDays | teamleadUsername |
|----------|-----------|----------|------|--------------|------------------|
| mmustermann | Max | Mustermann | employee | 30 | lschmidt |
| lschmidt | Lisa | Schmidt | teamlead | 30 | |
| pmeier | Peter | Meier | employee | 28 | lschmidt |

#### Import durchführen

1. Füllen Sie die Excel-Vorlage aus
2. Speichern Sie die Datei
3. Klicken Sie auf **Datei hochladen**
4. Wählen Sie die Excel-Datei
5. Prüfen Sie die **Vorschau**
6. Klicken Sie auf **Benutzer importieren**

#### Import-Hinweise

- **Passwörter:** Werden automatisch generiert
- **Duplikate:** Existierende Benutzernamen werden übersprungen
- **Teamleiter:** Müssen vor ihren Teammitgliedern importiert werden
- **Reihenfolge:** Manager → Teamleiter → Mitarbeiter

---

## Technische Informationen

### Standard-Admin-Zugangsdaten

| Feld | Wert |
|------|------|
| Benutzername | admin |
| Passwort | admin123 |

> **Wichtig:** Ändern Sie das Passwort nach der ersten Anmeldung!

### Datenbank

- **Typ:** SQLite (embedded)
- **Pfad:** `server/database/sqlite.db`
- **Backup-Pfad:** `server/database/backups/`

### API-Endpunkte (für Entwickler)

| Endpunkt | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/admin/backup` | POST | Backup erstellen |
| `/api/admin/backup/last` | GET | Letztes Backup Info |
| `/api/admin/backup/download` | GET | Backup herunterladen |
| `/api/admin/clear` | POST | Datenbank zurücksetzen |
| `/api/admin/import-users` | POST | Benutzer importieren |

---

## Fehlerbehebung

### Problem: Backup schlägt fehl

**Mögliche Ursachen:**
- Nicht genügend Speicherplatz
- Datenbankdatei gesperrt

**Lösung:**
1. Prüfen Sie den Speicherplatz
2. Starten Sie den Server neu
3. Versuchen Sie es erneut

### Problem: Import schlägt fehl

**Mögliche Ursachen:**
- Falsches Dateiformat
- Fehlende Pflichtfelder
- Ungültige Rollennamen

**Lösung:**
1. Verwenden Sie die offizielle Vorlage
2. Prüfen Sie alle Pflichtfelder
3. Verwenden Sie exakte Rollennamen

### Problem: Reset funktioniert nicht

**Mögliche Ursachen:**
- Checkbox nicht aktiviert
- Datenbankfehler

**Lösung:**
1. Aktivieren Sie die Bestätigungs-Checkbox
2. Bei Datenbankfehlern: Server neu starten

---

## Sicherheitsempfehlungen

### 1. Admin-Passwort ändern

Nach der Installation:
1. Anmelden als admin
2. Passwort ändern auf ein sicheres Passwort
3. Passwort sicher aufbewahren

### 2. Regelmäßige Backups

- Mindestens wöchentlich
- Vor jedem Update
- An sicherem Ort speichern

### 3. Zugriff beschränken

- Admin-Account nur für technische Verwaltung
- Für Urlaubsverwaltung: Manager-Account verwenden

### 4. Audit-Log

Wichtige Aktionen werden geloggt:
- Server-Konsole prüfen
- Bei Problemen: Logs sichern

---

## Checkliste für Systemwartung

### Täglich
- [ ] Anwendung erreichbar prüfen
- [ ] Fehler in Logs prüfen

### Wöchentlich
- [ ] Backup erstellen und herunterladen
- [ ] Speicherplatz prüfen

### Monatlich
- [ ] Backup-Integrität testen
- [ ] Nicht mehr benötigte Backups löschen

### Jährlich
- [ ] Passwörter rotieren
- [ ] Dokumentation aktualisieren
- [ ] Updates prüfen

---

## Kontakt bei technischen Problemen

Bei technischen Problemen:
1. Logs sichern
2. Backup erstellen (falls möglich)
3. Fehlerbeschreibung dokumentieren
4. IT-Support kontaktieren

---

*Letzte Aktualisierung: Januar 2026*
