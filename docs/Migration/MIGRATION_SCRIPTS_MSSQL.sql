-- ============================================================================
-- MICROSOFT SQL SERVER MIGRATION SCRIPTS
-- Urlaubsverwaltungssystem - Schema und Datenmigration
-- ============================================================================

-- ============================================================================
-- TEIL 1: DATENBANK ERSTELLEN
-- ============================================================================

-- Datenbank erstellen (als Admin ausführen)
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'vacation_db')
BEGIN
    CREATE DATABASE vacation_db;
END
GO

USE vacation_db;
GO

-- ============================================================================
-- TEIL 2: TABELLEN ERSTELLEN
-- ============================================================================

-- 1. Users Tabelle
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
BEGIN
    CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(100) NOT NULL UNIQUE,
        password NVARCHAR(255) NOT NULL,
        firstName NVARCHAR(100) NOT NULL,
        lastName NVARCHAR(100) NOT NULL,
        role NVARCHAR(20) NOT NULL DEFAULT 'employee',
        vacationDays INT NOT NULL DEFAULT 30,
        isActive BIT NOT NULL DEFAULT 1,
        createdAt DATETIME2 DEFAULT GETDATE(),
        updatedAt DATETIME2 DEFAULT GETDATE(),

        CONSTRAINT CK_users_role CHECK (role IN ('employee', 'teamlead', 'manager', 'office', 'sysadmin'))
    );

    CREATE INDEX IX_users_username ON users(username);
    CREATE INDEX IX_users_role ON users(role);
    CREATE INDEX IX_users_isActive ON users(isActive);

    PRINT 'Tabelle users erstellt';
END
GO

-- 2. Vacation Requests Tabelle
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='vacation_requests' AND xtype='U')
BEGIN
    CREATE TABLE vacation_requests (
        id INT IDENTITY(1,1) PRIMARY KEY,
        userId NVARCHAR(100) NOT NULL,
        displayName NVARCHAR(200) NOT NULL,
        startDate DATE NOT NULL,
        endDate DATE NOT NULL,
        reason NVARCHAR(MAX),
        status NVARCHAR(20) NOT NULL DEFAULT 'pending',
        teamleadApprovalDate DATETIME2,
        managerApprovalDate DATETIME2,
        cancelReason NVARCHAR(MAX),
        createdAt DATETIME2 DEFAULT GETDATE(),

        CONSTRAINT FK_vacation_requests_user FOREIGN KEY (userId) REFERENCES users(username),
        CONSTRAINT CK_vacation_requests_status CHECK (status IN ('pending', 'teamlead_approved', 'approved', 'rejected', 'cancelled')),
        CONSTRAINT CK_vacation_requests_dates CHECK (endDate >= startDate)
    );

    CREATE INDEX IX_vacation_requests_userId ON vacation_requests(userId);
    CREATE INDEX IX_vacation_requests_status ON vacation_requests(status);
    CREATE INDEX IX_vacation_requests_startDate ON vacation_requests(startDate);
    CREATE INDEX IX_vacation_requests_createdAt ON vacation_requests(createdAt DESC);

    PRINT 'Tabelle vacation_requests erstellt';
END
GO

-- 3. Organization Tabelle
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='organization' AND xtype='U')
BEGIN
    CREATE TABLE organization (
        id INT IDENTITY(1,1) PRIMARY KEY,
        userId NVARCHAR(100) NOT NULL,
        teamleadId NVARCHAR(100),
        createdAt DATETIME2 DEFAULT GETDATE(),

        CONSTRAINT FK_organization_user FOREIGN KEY (userId) REFERENCES users(username),
        CONSTRAINT FK_organization_teamlead FOREIGN KEY (teamleadId) REFERENCES users(username),
        CONSTRAINT UQ_organization_userId UNIQUE (userId)
    );

    CREATE INDEX IX_organization_teamleadId ON organization(teamleadId);

    PRINT 'Tabelle organization erstellt';
END
GO

-- 4. Carryover Tabelle
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='carryover' AND xtype='U')
BEGIN
    CREATE TABLE carryover (
        id INT IDENTITY(1,1) PRIMARY KEY,
        userId NVARCHAR(100) NOT NULL,
        year INT NOT NULL,
        calculatedDays DECIMAL(5,1) NOT NULL,
        approvedDays DECIMAL(5,1),
        reason NVARCHAR(MAX),
        status NVARCHAR(20) NOT NULL DEFAULT 'pending',
        createdAt DATETIME2 DEFAULT GETDATE(),

        CONSTRAINT FK_carryover_user FOREIGN KEY (userId) REFERENCES users(username),
        CONSTRAINT UQ_carryover_user_year UNIQUE (userId, year),
        CONSTRAINT CK_carryover_status CHECK (status IN ('pending', 'approved'))
    );

    CREATE INDEX IX_carryover_year ON carryover(year);

    PRINT 'Tabelle carryover erstellt';
END
GO

-- 5. Half Day Rules Tabelle
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='half_day_rules' AND xtype='U')
BEGIN
    CREATE TABLE half_day_rules (
        id INT IDENTITY(1,1) PRIMARY KEY,
        date DATE NOT NULL UNIQUE,
        description NVARCHAR(255) NOT NULL,
        createdAt DATETIME2 DEFAULT GETDATE()
    );

    CREATE INDEX IX_half_day_rules_date ON half_day_rules(date);

    PRINT 'Tabelle half_day_rules erstellt';
END
GO

-- 6. Vacation Exceptions Tabelle
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='vacation_exceptions' AND xtype='U')
BEGIN
    CREATE TABLE vacation_exceptions (
        id INT IDENTITY(1,1) PRIMARY KEY,
        vacationRequestId INT NOT NULL,
        userId NVARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        deduction DECIMAL(3,1) NOT NULL,
        reason NVARCHAR(MAX) NOT NULL,
        createdBy NVARCHAR(100) NOT NULL,
        createdAt DATETIME2 DEFAULT GETDATE(),

        CONSTRAINT FK_vacation_exceptions_request FOREIGN KEY (vacationRequestId) REFERENCES vacation_requests(id),
        CONSTRAINT FK_vacation_exceptions_user FOREIGN KEY (userId) REFERENCES users(username),
        CONSTRAINT UQ_vacation_exceptions_request_date UNIQUE (vacationRequestId, date)
    );

    CREATE INDEX IX_vacation_exceptions_userId ON vacation_exceptions(userId);

    PRINT 'Tabelle vacation_exceptions erstellt';
END
GO

-- ============================================================================
-- TEIL 3: STORED PROCEDURES
-- ============================================================================

-- Benutzer erstellen
IF OBJECT_ID('sp_CreateUser', 'P') IS NOT NULL DROP PROCEDURE sp_CreateUser;
GO

CREATE PROCEDURE sp_CreateUser
    @username NVARCHAR(100),
    @password NVARCHAR(255),
    @firstName NVARCHAR(100),
    @lastName NVARCHAR(100),
    @role NVARCHAR(20) = 'employee',
    @vacationDays INT = 30,
    @teamleadId NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRANSACTION;

    BEGIN TRY
        -- User einfügen
        INSERT INTO users (username, password, firstName, lastName, role, vacationDays)
        VALUES (@username, @password, @firstName, @lastName, @role, @vacationDays);

        -- Organization-Eintrag
        INSERT INTO organization (userId, teamleadId)
        VALUES (@username, @teamleadId);

        COMMIT TRANSACTION;

        SELECT SCOPE_IDENTITY() AS userId;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- Urlaubsantrag erstellen
IF OBJECT_ID('sp_CreateVacationRequest', 'P') IS NOT NULL DROP PROCEDURE sp_CreateVacationRequest;
GO

CREATE PROCEDURE sp_CreateVacationRequest
    @userId NVARCHAR(100),
    @displayName NVARCHAR(200),
    @startDate DATE,
    @endDate DATE,
    @reason NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO vacation_requests (userId, displayName, startDate, endDate, reason)
    VALUES (@userId, @displayName, @startDate, @endDate, @reason);

    SELECT SCOPE_IDENTITY() AS requestId;
END
GO

-- Urlaubsantrag genehmigen
IF OBJECT_ID('sp_ApproveVacationRequest', 'P') IS NOT NULL DROP PROCEDURE sp_ApproveVacationRequest;
GO

CREATE PROCEDURE sp_ApproveVacationRequest
    @requestId INT,
    @approvalLevel NVARCHAR(20) -- 'teamlead' oder 'manager'
AS
BEGIN
    SET NOCOUNT ON;

    IF @approvalLevel = 'teamlead'
    BEGIN
        UPDATE vacation_requests
        SET status = 'teamlead_approved',
            teamleadApprovalDate = GETDATE()
        WHERE id = @requestId AND status = 'pending';
    END
    ELSE IF @approvalLevel = 'manager'
    BEGIN
        UPDATE vacation_requests
        SET status = 'approved',
            managerApprovalDate = GETDATE()
        WHERE id = @requestId AND status IN ('pending', 'teamlead_approved');
    END

    SELECT @@ROWCOUNT AS rowsAffected;
END
GO

-- Urlaubssaldo berechnen
IF OBJECT_ID('fn_GetVacationBalance', 'FN') IS NOT NULL DROP FUNCTION fn_GetVacationBalance;
GO

CREATE FUNCTION fn_GetVacationBalance(@username NVARCHAR(100), @year INT)
RETURNS TABLE
AS
RETURN
(
    WITH ApprovedDays AS (
        SELECT
            COALESCE(SUM(
                DATEDIFF(DAY, startDate, endDate) + 1
                -- TODO: Wochenenden und Feiertage abziehen
            ), 0) AS usedDays
        FROM vacation_requests
        WHERE userId = @username
          AND status = 'approved'
          AND YEAR(startDate) = @year
    ),
    CarryoverDays AS (
        SELECT COALESCE(approvedDays, calculatedDays, 0) AS carryover
        FROM carryover
        WHERE userId = @username AND year = @year
    )
    SELECT
        u.vacationDays + COALESCE(c.carryover, 0) AS totalDays,
        a.usedDays,
        u.vacationDays + COALESCE(c.carryover, 0) - a.usedDays AS remainingDays,
        COALESCE(c.carryover, 0) AS carryoverDays
    FROM users u
    CROSS JOIN ApprovedDays a
    LEFT JOIN CarryoverDays c ON 1=1
    WHERE u.username = @username
);
GO

-- ============================================================================
-- TEIL 4: VIEWS
-- ============================================================================

-- Übersicht aller Urlaubsanträge mit User-Details
IF OBJECT_ID('vw_VacationRequestsDetailed', 'V') IS NOT NULL DROP VIEW vw_VacationRequestsDetailed;
GO

CREATE VIEW vw_VacationRequestsDetailed AS
SELECT
    vr.id,
    vr.userId,
    CONCAT(u.firstName, ' ', u.lastName) AS displayName,
    vr.startDate,
    vr.endDate,
    DATEDIFF(DAY, vr.startDate, vr.endDate) + 1 AS totalDays,
    vr.reason,
    vr.status,
    vr.teamleadApprovalDate,
    vr.managerApprovalDate,
    vr.cancelReason,
    vr.createdAt,
    u.role AS userRole,
    o.teamleadId,
    tl.firstName + ' ' + tl.lastName AS teamleadName
FROM vacation_requests vr
INNER JOIN users u ON vr.userId = u.username
LEFT JOIN organization o ON vr.userId = o.userId
LEFT JOIN users tl ON o.teamleadId = tl.username;
GO

-- Team-Übersicht für Teamleiter
IF OBJECT_ID('vw_TeamOverview', 'V') IS NOT NULL DROP VIEW vw_TeamOverview;
GO

CREATE VIEW vw_TeamOverview AS
SELECT
    o.teamleadId,
    CONCAT(tl.firstName, ' ', tl.lastName) AS teamleadName,
    u.username AS memberId,
    CONCAT(u.firstName, ' ', u.lastName) AS memberName,
    u.role AS memberRole,
    u.vacationDays,
    u.isActive
FROM organization o
INNER JOIN users u ON o.userId = u.username
LEFT JOIN users tl ON o.teamleadId = tl.username
WHERE u.isActive = 1;
GO

-- ============================================================================
-- TEIL 5: TRIGGER
-- ============================================================================

-- Trigger für updatedAt
IF OBJECT_ID('trg_users_update', 'TR') IS NOT NULL DROP TRIGGER trg_users_update;
GO

CREATE TRIGGER trg_users_update
ON users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE users
    SET updatedAt = GETDATE()
    FROM users u
    INNER JOIN inserted i ON u.id = i.id;
END
GO

-- ============================================================================
-- TEIL 6: ADMIN-BENUTZER ERSTELLEN
-- ============================================================================

-- Admin-User erstellen (Passwort: admin123, bcrypt-Hash)
IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin')
BEGIN
    -- HINWEIS: Der Hash muss in der Anwendung generiert werden
    -- Dies ist ein Platzhalter-Hash für 'admin123'
    INSERT INTO users (username, password, firstName, lastName, role, vacationDays, isActive)
    VALUES ('admin', '$2b$10$placeholder_hash_generate_in_app', 'Admin', 'User', 'sysadmin', 30, 1);

    INSERT INTO organization (userId, teamleadId)
    VALUES ('admin', NULL);

    PRINT 'Admin-User erstellt (Passwort muss in App generiert werden)';
END
GO

-- ============================================================================
-- TEIL 7: BEISPIEL-DATEN FÜR HALBTAGE
-- ============================================================================

-- Standard-Halbtage einfügen
INSERT INTO half_day_rules (date, description) VALUES
('2026-12-24', 'Heiligabend'),
('2026-12-31', 'Silvester'),
('2026-01-05', 'Heilige Drei Könige (Vorabend)');
GO

PRINT '=== Migration abgeschlossen ===';
GO
