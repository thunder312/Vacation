-- Migration: carryover_adjustments Tabelle erstellen
-- Diese Tabelle speichert Manager-Entscheidungen zu Urlaubstage-Überträgen

CREATE TABLE IF NOT EXISTS carryover_adjustments (
  userId TEXT NOT NULL,
  year INTEGER NOT NULL,
  originalDays REAL NOT NULL,        -- Berechneter Übertrag
  approvedDays REAL NOT NULL,        -- Genehmigter Übertrag
  status TEXT NOT NULL,               -- 'pending', 'approved', 'adjusted'
  adjustmentReason TEXT,              -- Begründung bei Anpassung
  adjustedBy TEXT,                    -- Manager der angepasst hat
  adjustedAt TEXT,                    -- Zeitpunkt der Anpassung
  approvedBy TEXT,                    -- Manager der bestätigt hat
  approvedAt TEXT,                    -- Zeitpunkt der Bestätigung
  PRIMARY KEY (userId, year),
  FOREIGN KEY (userId) REFERENCES users(userId)
);

-- Index für schnellere Abfragen
CREATE INDEX IF NOT EXISTS idx_carryover_year ON carryover_adjustments(year);
CREATE INDEX IF NOT EXISTS idx_carryover_status ON carryover_adjustments(status);
