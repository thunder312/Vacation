# TODOs
   ## bugs
  - Warnung bei zuvielen Tagen schon beim Beantragen
  - Manager kann keinen Urlaub beantragen

   ## business logic
  - Kalender-PDF pro Monat
  - <del>days off per year: 30 (carryover to next year)</del>
  - <del>custom days (holidays) addable by admin, even half days</del>
  - <del>role: office (see as admin, but no edits)</del>
  - <del>Year-report with statistics (days carried over, middle vacation length); 1 page per person</del>
  - <del>Office is also a regular user, so it shall be able to add vacations for herself, which only needs to be granted by the manager</del>
  - <del>Teamlead proposals only need to granted by manager</del>
  - <del>Rename Teamlead in all texts to Teamleiter</del>
  - <del> company orga (1 boss, x teamleads, y associates) -> teamlead can only permit his teams' vacations</del>
  - <del>Manager can re-book granted vacations. -> Customer gets back his days the state for  the dataset is "abgesagt".</del>
  - <del>Manager can add new MA (with custom vacation days - default: 30)</del>
  - <del>admin/manager shall be able to deactivate users by date which left company (not shown anywhere anymore like team...)</del>
  - <del>hide admin in Organigramm and everywhere</del>
  - Mitarbeiterverwaltung: 
    - <del>deactivate doesn't work,</del> 
    - <del>edit doesn't work,</del> 
    - <del>Organigramm needs to be refreshed automatically.</del>
    - <del>Mitarbeiterverwaltung shall be refreshed by Origanigramm changes.</dev>
    - <del>PDF How-To for new users has optical problem in yellow block.</dev>
    - <del>reset PW for manager (admin)</del>
    - <del>admin/manager shall be able to reactivate users
  - <del>Mitarbeiter needs to change their PW themselves</del>
  - <del>new Rolle: SysAdmin</del>
  - <del>!!!! neue Rolle SysAdmin hat Mitarbeiter-Zuordnung und Organigramm zerstört !!!!!</dev>
  - <del>print organigramm landscape PDF</del>
   
## optical
  - <del>css with fondsKonzept blue</del>
  - <del>favicon</del>
  - <del>pdf logo</del>
  - <del>pdf logo on all reports.</del>
  - <del>Mitarbeiterverwaltung: retractable task blocks (new, edit)?</del>
  - <del>PDF shall have page numbers (1/5)</del>
  - <del>Alle Urlaube shall ordered by von-date, then bis-date and group by user.</del>
  - <del>Finish about modal</del>
  - Create Manual deutsch/englisch
  - <del>dummy company for gitHub</del>

## Code organization
- all icons (Organigramm, scheme, toasts?...) as images in assets to be easier swapable.
- complete i18n
- FINAL Version of seed and scheme.
- PDF alle in app/utils/pdf/exports (beate /shared mit header und footer)
- css doch aufteilen?
- admin als eigene Rolle? (aktuell 'manager' wie Chef)

## DB
  - <del>DB connection</del>
  - <del>database structure (users, roles, datasets)</del>