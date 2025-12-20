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
    actions: 'Actions'
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
    teamRequests: 'Team Requests',
    managerApproval: 'Manager Approval',
    vacationRules: 'Vacation Rules',
    
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
    
    // Messages
    requestSubmitted: 'Vacation request successfully submitted',
    requestApproved: 'Vacation request approved',
    requestRejected: 'Vacation request rejected',
    requestCancelled: 'Vacation cancelled',
    pdfCreated: 'PDF successfully created!',
    
    // Half-day Rules
    halfDayRules: 'Half-Day Rules',
    addHalfDay: 'Add Half-Day',
    halfDayDate: 'Date',
    halfDayDescription: 'Description',
    halfDayDescriptionPlaceholder: 'e.g. Christmas Eve, New Year\'s Eve...'
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
    unassignedEmployees: 'Unassigned Employees',
    assignToTeam: 'Assign Employee to Team',
    employee: 'Employee',
    selectEmployee: 'Select Employee...',
    selectTeamlead: 'Select Team Lead...',
    assignButton: 'Save Assignment',
    
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
    noVacationDaysLeft: 'No vacation days available'
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
