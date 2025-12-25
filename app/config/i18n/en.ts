// app/config/i18n/en.ts
import type { Translation } from './de'

/**
 * English Translations
 */
export const en: Translation = {
  // General
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    yes: 'Yes',
    no: 'No',
    optional: 'Optional',
    required: 'Required',
    days: 'Days',
    day: 'Day',
    from: 'From',
    to: 'To',
    date: 'Date',
    reason: 'Reason',
    status: 'Status',
    actions: 'Actions',
    year: 'Year',
    allYears: 'All Years'
  },

  // Navigation
  nav: {
    home: 'Home',
    vacation: 'Vacation',
    organization: 'Organization Chart',
    users: 'User Management',
    settings: 'Settings',
    logout: 'Logout'
  },

  // Login
  login: {
    title: 'Login',
    username: 'Username',
    password: 'Password',
    usernamePlaceholder: 'Enter username',
    passwordPlaceholder: 'Enter password',
    loginButton: 'Sign In',
    error: 'Invalid username or password',
    welcome: 'Welcome back!'
  },

  // Roles
  roles: {
    employee: 'Employee',
    teamlead: 'Team Lead',
    manager: 'Manager',
    office: 'Office',
    sysadmin: 'System Admin'
  },

  // Status
  status: {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    teamleadApproved: 'Team Lead Approved'
  },

  // Vacation Management
  vacation: {
    title: 'Vacation Management',
    myVacation: 'My Vacation',
    myRequest: 'My Request',
    teamRequests: 'Team Lead View',
    managerApproval: 'Manager View',
    vacationRules: 'Vacation Rules',
    approvedVacations: 'Approved Vacations',
    reports: 'Reports',
    calendar: 'Calendar',
    
    // Form
    requestVacation: 'Request Vacation',
    startDate: 'Start Date',
    endDate: 'End Date',
    reason: 'Reason',
    reasonPlaceholder: 'e.g. Family vacation, Recreation...',
    submit: 'Submit Request',
    
    // Overview
    vacationDays: 'Vacation Days',
    remainingDays: 'Remaining Days',
    usedDays: 'Used Days',
    totalDays: 'Total',
    carryover: 'Carryover',
    standard: 'Standard',
    
    // Actions
    approve: 'Approve',
    reject: 'Reject',
    cancel: 'Cancel Vacation',
    cancelReason: 'Cancellation Reason',
    cancelWarning: 'The approved vacation will be cancelled and vacation days will be refunded.',
    
    // Export
    exportPdf: 'Export PDF',
    exportTeamPdf: 'Export Team PDF',
    exportAllPdf: 'Export All Vacations as PDF',
    exportMyApprovedVacations: 'Export Approved Vacations',
    
    // Messages
    requestSubmitted: 'Vacation request successfully submitted',
    requestApproved: 'Vacation request approved',
    requestRejected: 'Vacation request rejected',
    requestCancelled: 'Vacation cancelled',
    pdfCreated: 'PDF successfully created!',
    pdfGenerating: 'Creating PDF, please wait...',
    
    // Half-day Rules
    halfDayRules: 'Half-Day Rules',
    addHalfDay: 'Add Half-Day',
    halfDayDate: 'Date',
    halfDayDescription: 'Description',
    halfDayDescriptionPlaceholder: 'e.g. Christmas Eve, New Year\'s Eve...',
    noHalfDayRules: 'No half-day rules defined yet',
    
    // Filter
    filterByEmployee: 'Filter by employee:',
    filterByYear: 'Year:',
    enterName: 'Enter name...',
    requestsShown: '{shown} of {total} requests',
    noRequestsForFilter: 'No vacations found for this filter',
    noApprovedVacations: 'No approved vacations',
    
    // Carryover
    carryoverManagement: 'Vacation Days Carryover {action}',
    carryoverManage: 'manage',
    carryoverOverview: 'overview',
    carryoverReview: 'Review Vacation Days Carryover ({year})',
    carryoverAdjust: 'Adjust Carryover',
    carryoverAdd: 'Add/Edit Carryover',
    carryoverInfo: 'Vacation Days Carryover {year}',
    carryoverPending: 'Vacation Days Carryover Under Review',
    carryoverApproved: 'Vacation Days Carryover Adjusted',
    carryoverIncluding: 'Incl. {days} days carryover from {year}',
    carryoverCalculated: 'Calculated Carryover:',
    carryoverApprovedAmount: 'Approved Carryover:',
    carryoverNewAmount: 'New Carryover (Days) *',
    carryoverReasonLabel: 'Reason for Adjustment *',
    carryoverReasonPlaceholder: 'Please explain the reason for the carryover adjustment...',
    carryoverSave: 'Save Carryover',
    carryoverManagerReviewing: 'Your manager is currently reviewing your calculated carryover of {days} days from {year}.'
  },

  // Reports
  reports: {
    title: 'Reports & Statistics',
    annualReport: 'Annual Vacation Report',
    annualReportDescription: 'Creates a comprehensive annual report for all employees with overall statistics, individual vacation records and signature templates.',
    selectYear: 'Select year:',
    preview: 'Preview Overall Statistics {year}',
    createPdf: 'Create Annual Report as PDF',
    creating: 'Creating PDF...',
    employees: 'Employees',
    totalVacationDays: 'Total Vacation Days',
    averagePerEmployee: 'Avg. per Employee',
    taken: 'Taken',
    remaining: 'Remaining',
    quota: 'Quota',
    pdfContains: 'The PDF contains:',
    pdfPage1: 'Page 1: Overall statistics for all employees',
    pdfPage2Plus: 'From page 2: Individual record per employee (alphabetically sorted)',
    pdfSignatures: 'Each employee page includes a signature template for confirmation',
    loadingStatistics: 'Loading statistics...'
  },

  // User Management
  users: {
    title: 'User Management',
    addUser: 'Add Employee',
    existingUsers: 'Existing Employees',
    
    // Form
    firstName: 'First Name',
    lastName: 'Last Name',
    generated: 'generated',
    username: 'Username',
    role: 'Role',
    yourRole: 'Your role',
    roleSelect: 'Please select...',
    teamlead: 'Team Lead',
    teamleadSelect: 'Select Team Lead...',
    yourTeamlead: 'Your Team Lead',
    password: 'Password',
    vacationDays: 'Vacation Days',
    vacationDaysPerYear: 'Vacation Days per Year',
    
    // Placeholders
    firstNamePlaceholder: 'John',
    lastNamePlaceholder: 'Doe',
    
    // Table
    name: 'Name',
    displayName: 'Display Name',
    
    // Actions
    editUser: 'Edit User',
    resetPassword: 'Reset Password',
    deactivateUser: 'Deactivate User',
    activateUser: 'Activate User',
    regeneratePassword: 'Regenerate Password',
    
    // Filter
    showInactive: 'Show Inactive',
    searchPlaceholder: 'Search by first or last name...',
    
    // Messages
    userCreated: 'User successfully created',
    userUpdated: 'User updated',
    passwordReset: 'Password reset',
    userDeactivated: 'User deactivated',
    userActivated: 'User activated',
    
    // Password
    changePassword: 'Change Password',
    oldPassword: 'Old Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    passwordChanged: 'Password successfully changed',
    passwordsNotMatch: 'Passwords do not match',
    passwordTooShort: 'Password must be at least 8 characters',
    passwordNote: 'Secure password - can be edited'
  },

  // Organization Chart
  organization: {
    title: 'Organization Chart',
    description: 'Overview of organizational structure and team assignments.',
    exportOrgChart: 'Export Organization Chart as PDF',
    exportTeamOverview: 'Export Team Overview as PDF',
    
    // Team Management
    teamManagement: 'Team Management',
    teams: 'Teams',
    assignEmployeesToTeams: 'Assign employees to teams',
    unassignedEmployees: 'Unassigned Employees',
    assignToTeam: 'Assign Employee to Team',
    employee: 'Employee',
    selectEmployee: 'Select Employee...',
    selectTeamlead: 'Select Team Lead...',
    assignButton: 'Save Assignment',
    noEmployeesAssigned: 'No employees assigned',
    removeFromTeam: 'Remove from team',
    
    // Organization Tree
    orgChart: 'Organization Chart',
    graphicalRepresentation: 'Graphical representation of organizational structure',
    
    // Statistics
    statistics: 'Statistics',
    totalEmployees: 'Total Employees',
    teamleads: 'Team Leads',
    employees: 'Employees',
    
    // PDF
    orgChartPdf: 'Organization Chart - {company}',
    teamOverviewPdf: 'Team Overview - {company}',
    vacationOverviewPdf: 'Vacation Overview - {company}',
    createdOn: 'Created on',
    supervisor: 'Supervisor',
    teamMembers: 'Team Members',
    notAssigned: 'Not Assigned'
  },

  // Error Messages
  errors: {
    genericError: 'An error occurred',
    networkError: 'Network error',
    notFound: 'Not found',
    unauthorized: 'Unauthorized',
    forbidden: 'Access denied',
    serverError: 'Server error',
    validationError: 'Validation error',
    required: 'This field is required',
    invalidEmail: 'Invalid email address',
    invalidDate: 'Invalid date',
    startDateAfterEndDate: 'Start date must be before end date',
    noVacationDaysLeft: 'No vacation days available',
    loadingStatistics: 'Error loading statistics',
    creatingPdf: 'Error creating PDF'
  },

  // PDF Texts
  pdf: {
    page: 'Page',
    totalPages: 'Page {current}/{total}',
    myApprovedVacations: 'My Approved Vacations',
    teamVacations: 'Team Vacation Overview',
    allVacations: 'Vacation Overview',
    vacationAccount: 'Vacation Account',
    totalApprovedDays: 'Total Approved Vacation Days',
    totalRequests: 'Total Requests',
    fullyApproved: 'Fully Approved',
    pendingManager: 'Pending with Manager',
    pendingTeamlead: 'Pending with Team Lead',
    totalCancelledDays: 'Total Cancelled Vacation Days'
  },

  // Confirmation Dialogs
  confirm: {
    deleteTitle: 'Confirm Delete',
    deleteMessage: 'Do you really want to delete this entry?',
    cancelTitle: 'Confirm Cancel',
    cancelMessage: 'Do you really want to cancel this action?',
    logoutTitle: 'Confirm Logout',
    logoutMessage: 'Do you really want to logout?',
    resetPasswordTitle: 'Reset Password',
    resetPasswordMessage: 'Reset password for {name}?'
  },

  // About Dialog
  about: {
    title: '{appName}',
    version: 'Version {version}',
    developedBy: 'Developed by',
    leadDeveloper: 'Lead Developer',
    aiAssistant: 'AI Assistant by Anthropic',
    techStack: 'Technology Stack',
    copyright: '© {year} {company}',
    madeWith: 'Made with ❤️ in Germany'
  }
}
