# 🏖️ Urlaubsantrags-System

Ein vollständiges Urlaubsverwaltungssystem mit mehrstufigem Genehmigungsprozess, Organigramm und PDF-Export.

## 📋 Inhaltsverzeichnis

- [Features](#features)
- [Technologie-Stack](#technologie-stack)
- [Projektstruktur](#projektstruktur)
- [Installation](#installation)
- [Konfiguration](#konfiguration)
- [Benutzer & Rollen](#benutzer--rollen)
- [Verwendung](#verwendung)

## ✨ Features

### 🎯 Kernfunktionen
- **Mehrstufiger Genehmigungsprozess**: Employee → Teamlead → Manager
- **Urlaubskonto-Tracking**: 30 Tage Standard + Übertrag aus Vorjahr
- **Halbtags-Regelungen**: Spezielle Tage (z.B. Heiligabend, Silvester)
- **PDF-Export**: Urlaubsübersichten mit Resturlaubsanzeige
- **Organigramm**: Visualisierung der Unternehmensstruktur
- **Theme-Switching**: Business & Summer Theme

### 👥 Rollensystem
- **Employee**: Urlaubsanträge stellen, eigene Übersicht
- **Teamlead**: Erste Genehmigungsstufe für Team-Mitglieder
- **Manager**: Finale Genehmigung, Verwaltungsfunktionen
- **Office**: Nur-Lese-Zugriff auf alle Anträge
- **Sys-Admin**: Wie Employee, aber ohne Teamleiter
- **Admin**: Vollzugriff auf alle Funktionen

### 📊 Verwaltungsfunktionen (Manager/Admin)
- Firmeninterne Urlaubsregelungen (Halbtage)
- Urlaubstage-Übertrag verwalten
- Organigramm bearbeiten
- Team-Zuordnungen

## 🛠️ Technologie-Stack

- **Framework**: Nuxt 3
- **Sprache**: TypeScript
- **Styling**: CSS Custom Properties (Themes)
- **PDF-Export**: jsPDF + jsPDF-AutoTable
- **Datumsverwaltung**: Eigene Helpers + Feiertags-Logik (Bayern)

## 📂 Projektstruktur

```
project-root/
│
├── assets/css/
│   └── main.css                          # Alle Styles (zentralisiert)
│
├── components/
│   ├── CarryoverManager.vue              # Urlaubstage-Übertrag verwalten
│   ├── HalfDayRuleManager.vue            # Halbtags-Regelungen
│   ├── OrganizationChart.vue             # Organigramm Hauptkomponente
│   ├── OrgNode.vue                       # Einzelner Organigramm-Knoten
│   ├── ToastContainer.vue                # Toast-Benachrichtigungen
│   ├── VacationApprovalCard.vue          # Genehmigungs-Karte
│   ├── VacationBalanceCard.vue           # Urlaubskonto-Anzeige
│   ├── VacationRequestCard.vue           # Antrags-Karte
│   └── VacationRequestForm.vue           # Antragsformular
│
├── composables/
│   ├── useAuth.ts                        # Authentifizierung
│   ├── useCarryover.ts                   # Urlaubstage-Übertrag
│   ├── useHalfDayRules.ts                # Halbtags-Regelungen
│   ├── useOrganization.ts                # Organigramm-Logik
│   ├── usePdfExport.ts                   # PDF-Generierung
│   ├── useTheme.ts                       # Theme-Wechsel
│   ├── useToast.ts                       # Toast-Nachrichten
│   ├── useVacationBalance.ts             # Urlaubskonto-Berechnung
│   └── useVacationRequests.ts            # Urlaubsanträge
│
├── pages/
│   ├── index.vue                         # Startseite
│   ├── login.vue                         # Login-Seite
│   └── vacation.vue                      # Haupt-Anwendung
│
├── server/api/
│   └── login.post.ts                     # Login API-Route
│
├── types/
│   └── vacation.ts                       # TypeScript Interfaces
│
├── utils/
│   ├── dateHelpers.ts                    # Datums-Hilfsfunktionen
│   └── holidays.ts                       # Feiertags-Berechnung (Bayern)
│
└── credentials.txt                       # Benutzer-Datenbank (Development)
```

## 🚀 Installation

### Voraussetzungen
- Node.js 18+ 
- npm oder yarn

### Schritte

1. **Projekt klonen/erstellen**
```bash
npx nuxi@latest init urlaubssystem
cd urlaubssystem
```

2. **Abhängigkeiten installieren**
```bash
npm install
npm install jspdf jspdf-autotable
```

3. **Dateien einfügen**
   - Kopiere alle Dateien gemäß der Projektstruktur oben
   - Stelle sicher, dass `credentials.txt` im Root-Verzeichnis liegt

4. **Development Server starten**
```bash
npm run dev
```

5. **Öffne im Browser**
```
http://localhost:3000
```

## ⚙️ Konfiguration

### credentials.txt Format

```
# Format für admin/office:
username:password:role

# Format für normale Accounts:
Nachname:Vorname:Passwort:Rolle

# Beispiel:
admin:geheim123:manager
Schulz:Stefan:manager123:manager
Mueller:Thomas:teamleiter1:teamlead
Mustermann:Max:password123:employee
```

### Urlaubstage-Konfiguration

**Standard-Urlaubstage**: 30 Tage pro Jahr (konfigurierbar in `useVacationBalance.ts`)

**Übertrag**: Wird in `useCarryover.ts` verwaltet (Mock-Daten)

**Halbtage**: Werden in `useHalfDayRules.ts` definiert

## 👥 Benutzer & Rollen

### Login-Daten (Development)

| Login | Passwort | Name | Rolle |
|-------|----------|------|-------|
| admin | geheim123 | admin | manager |
| Schulz | manager123 | Stefan Schulz | manager |
| Meyer | office123 | Sandra Meyer | office |
| Mueller | teamleiter1 | Thomas Mueller | teamlead |
| Weber | teamleiter2 | Sarah Weber | teamlead |
| Fischer | teamleiter3 | Michael Fischer | teamlead |
| Mustermann | password123 | Max Mustermann | employee |
| Schmidt | password456 | Anna Schmidt | employee |
| Schneider | password789 | Lisa Schneider | employee |
| Becker | password321 | Jonas Becker | employee |
| Hoffmann | password654 | Julia Hoffmann | employee |
| Koch | password987 | Daniel Koch | employee |
| Bauer | password147 | Laura Bauer | employee |
| Richter | password258 | Sebastian Richter | employee |
| Klein | password369 | Nina Klein | employee |
| Wolf | password741 | Tim Wolf | employee |

### Organigramm-Struktur

```
Stefan Schulz (Manager)
├── Sandra Meyer (Office)
├── Thomas Mueller (Teamlead)
│   ├── Max Mustermann
│   ├── Anna Schmidt
│   └── Lisa Schneider
├── Sarah Weber (Teamlead)
│   ├── Jonas Becker
│   ├── Julia Hoffmann
│   └── Daniel Koch
└── Michael Fischer (Teamlead)
    ├── Laura Bauer
    ├── Sebastian Richter
    ├── Nina Klein
    └── Tim Wolf
```

## 📖 Verwendung

### Als Employee

1. **Login** mit Nachname (z.B. `Mustermann`) und Passwort
2. **Urlaubskonto** ansehen (Gesamt, Genommen, Verbleibend)
3. **Urlaubsantrag** stellen:
   - Von/Bis Datum wählen
   - Optional Grund angeben
   - Einreichen
4. **Meine Anträge** verfolgen (Status: Ausstehend → Teamlead → Genehmigt)
5. **PDF exportieren** von genehmigten Urlauben

### Als Teamlead

Alle Employee-Funktionen plus:
1. **Teamlead-Tab**: Anträge des eigenen Teams genehmigen/ablehnen
2. **Team-PDF** exportieren

### Als Manager

Alle Funktionen plus:
1. **Manager-Tab**: Final-Genehmigung aller Anträge
2. **Urlaubsregelung**: Halbtage definieren
3. **Übertrag**: Urlaubstage-Übertrag verwalten
4. **Organigramm**: Team-Zuordnungen bearbeiten

### Als Office

Nur-Lese-Zugriff auf:
- Übersicht aller Anträge
- Teamlead-Ansicht
- Manager-Ansicht

## 🎨 Themes

**Business Theme** (Standard): Professionelles Blau-Design

**Summer Theme**: Warme Orange-Töne

Theme-Wechsel über Button in der Tab-Leiste (☀️ / 💼)

## 📄 PDF-Export

PDFs enthalten:
- **Urlaubskonto-Info**: Gesamt, Übertrag, Genommen, Verbleibend
- **Urlaubsliste**: Alle genehmigten Urlaube mit Daten
- **Logo**: Logo (falls vorhanden unter `/public/Logo_[xyz]_noBg.png`)
- **Statistiken**: Gesamt-Urlaubstage

## 🔐 Sicherheit

⚠️ **WICHTIG**: Die aktuelle Implementierung ist NUR für Development!

**Für Production**:
- Passwörter hashen (bcrypt/argon2)
- JWT-basierte Authentifizierung
- Credentials in Datenbank (nicht Textdatei)
- HTTPS verwenden
- CSRF-Schutz
- Input-Validierung

## 🐛 Bekannte Einschränkungen

- Mock-Daten (keine echte Datenbank)
- Keine E-Mail-Benachrichtigungen
- Feiertags-Berechnung nur für Bayern

## 🔮 Geplante Features


## 📝 Lizenz
- Proprietary

## 👨‍💻 Entwickler
- Daniel Ertl
- Entwickelt mit Claude (Anthropic)

---

**Version**: 1.0.0  
**Letztes Update**: Dezember 2024
