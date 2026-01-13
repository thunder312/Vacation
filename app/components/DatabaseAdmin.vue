<template>
  <div class="database-admin">
    <div class="admin-header">
      <h2>{{ icons.admin?.database || '🗄️' }} {{ t('admin.database') }}</h2>
      <p class="description">{{ t('admin.databaseDescription') }}</p>
    </div>

    <!-- Backup Section -->
    <div class="admin-card">
      <h3>{{ icons.admin?.backup || '💾' }} {{ t('admin.databaseBackup') }}</h3>
      <p>{{ t('admin.backupDescription') }}</p>
      <div class="backup-actions">
        <button @click="createAndDownloadBackup" class="btn-primary" :disabled="creating">
          {{ creating ? (icons.admin?.loading || '⏳') + ' ' + t('admin.creating') : (icons.admin?.backup || '💾') + ' ' + t('admin.createBackup') }}
        </button>
      </div>
      <div v-if="lastBackup" class="backup-info">
        <small>{{ t('admin.lastBackup') }}: {{ formatDate(lastBackup.date) }} ({{ formatFileSize(lastBackup.size) }})</small>
      </div>
    </div>

    <!-- Clear Database Section -->
    <div class="admin-card danger-zone">
      <h3>{{ icons.admin?.clear || '🗑️' }} {{ t('admin.clearDatabase') }}</h3>
      <p class="warning-text">{{ icons.admin?.warning || '⚠️' }} {{ t('admin.clearWarning') }}</p>
      <div class="danger-actions">
        <label>
          <input type="checkbox" v-model="clearConfirmed" />
          {{ t('admin.clearConfirmText') }}
        </label>
        <button
          @click="clearDatabase"
          class="btn-danger"
          :disabled="!clearConfirmed || clearing"
        >
          {{ clearing ? (icons.admin?.loading || '⏳') + ' ' + t('admin.clearing') : (icons.admin?.clear || '🗑️') + ' ' + t('admin.clearDatabaseBtn') }}
        </button>
      </div>
    </div>

    <!-- Import Users Section -->
    <div class="admin-card">
      <h3>{{ icons.admin?.import || '📊' }} {{ t('admin.importUsers') }}</h3>
      <p>{{ t('admin.importDescription') }}</p>

      <!-- Template Download -->
      <div class="import-step">
        <h4>1. {{ t('admin.downloadTemplate') }}</h4>
        <button @click="downloadTemplate" class="btn-secondary">
          {{ icons.admin?.download || '📥' }} {{ t('admin.downloadExcelTemplate') }}
        </button>
      </div>

      <!-- File Upload -->
      <div class="import-step">
        <h4>2. {{ t('admin.uploadFile') }}</h4>
        <input
          type="file"
          ref="fileInput"
          @change="handleFileSelect"
          accept=".xlsx,.xls"
          class="file-input"
        />
        <div v-if="selectedFile" class="file-info">
          {{ icons.admin?.document || '📄' }} {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
        </div>
      </div>

      <!-- Preview -->
      <div v-if="previewData.length > 0" class="import-step">
        <h4>3. {{ t('admin.preview') }}</h4>
        <div class="preview-table">
          <table>
            <thead>
              <tr>
                <th>{{ t('admin.username') }}</th>
                <th>{{ t('admin.role') }}</th>
                <th>{{ t('admin.teamleadUsername') }}</th>
                <th>{{ t('admin.vacationDays') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in previewData.slice(0, 5)" :key="index">
                <td>{{ row.username }}</td>
                <td>{{ row.role }}</td>
                <td>{{ row.teamleadUsername || '-' }}</td>
                <td>{{ row.vacationDays }}</td>
              </tr>
            </tbody>
          </table>
          <p v-if="previewData.length > 5" class="preview-more">
            {{ t('admin.andMore', { count: previewData.length - 5 }) }}
          </p>
        </div>
        <button @click="importUsers" class="btn-primary" :disabled="importing">
          {{ importing ? (icons.admin?.loading || '⏳') + ' ' + t('admin.importing') : (icons.admin?.import || '📊') + ' ' + t('admin.importUsersBtn') }}
        </button>
      </div>

      <!-- Import Result -->
      <div v-if="importResult" class="import-result" :class="importResult.success ? 'success' : 'error'">
        <h4>{{ importResult.success ? (icons.admin?.success || '✓') + ' ' + t('admin.importSuccess') : (icons.admin?.error || '✗') + ' ' + t('admin.importError') }}</h4>
        <p>{{ importResult.message }}</p>
        <ul v-if="importResult.details">
          <li v-for="(detail, index) in importResult.details" :key="index">{{ detail }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as XLSX from 'xlsx'
import { icons } from '~/config/icons'

const toast = useToast()
const { confirm } = useConfirm()
const { t } = useI18n()

// State
const creating = ref(false)
const clearing = ref(false)
const importing = ref(false)
const clearConfirmed = ref(false)
const lastBackup = ref<any>(null)
const selectedFile = ref<File | null>(null)
const previewData = ref<any[]>([])
const importResult = ref<any>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// Backup erstellen
const createAndDownloadBackup = async () => {
  creating.value = true
  try {
    const response = await fetch('/api/admin/backup/download', { 
      method: 'GET',
      headers: { 'Accept': 'application/sql' }
    })
    
    if (!response.ok) throw new Error('Backup failed')
    
    const sqlContent = await response.text()
    const blob = new Blob([sqlContent], { type: 'application/sql' })
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `vacation-backup-${timestamp}.sql`
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.style.display = 'none'
    
    document.body.appendChild(a)
    a.click()
    
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)
    
    lastBackup.value = {
      date: new Date().toISOString(),
      size: blob.size
    }
    
    toast.success(t('admin.backupCreated'))
  } catch (err: any) {
    console.error('Backup Fehler:', err)
    toast.error(t('admin.backupError'))
  } finally {
    creating.value = false
  }
}

// Datenbank leeren
const clearDatabase = async () => {
  const confirmed = await confirm({
    title: t('admin.clearDatabase'),
    message: t('admin.clearConfirmDialog'),
    confirmText: t('admin.clearDatabase'),
    type: 'danger'
  })
  if (!confirmed) return
  
  clearing.value = true
  try {
    await $fetch('/api/admin/clear', { method: 'POST' })
    clearConfirmed.value = false
    toast.success(t('admin.databaseCleared'))
  } catch (err: any) {
    console.error('Clear Fehler:', err)
    toast.error(t('admin.clearError'))
  } finally {
    clearing.value = false
  }
}

// Excel-Template herunterladen
const downloadTemplate = () => {
  const template = [
    ['username', 'firstName', 'lastName', 'role', 'teamleadUsername', 'vacationDays'],
    ['john.doe', 'John', 'Doe', 'manager', '', '30'],
    ['anna.schmidt', 'Anna', 'Schmidt', 'teamlead', 'john.doe', '30'],
    ['max.mustermann', 'Max', 'Mustermann', 'employee', 'anna.schmidt', '30']
  ]
  
  const ws = XLSX.utils.aoa_to_sheet(template)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Users')
  XLSX.writeFile(wb, 'user-import-template.xlsx')
  toast.success(t('admin.templateDownloaded'))
}

// Datei auswählen
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  selectedFile.value = file
  importResult.value = null
  
  try {
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(worksheet)
    
    previewData.value = jsonData.map((row: any) => ({
      username: row.username || '',
      firstName: row.firstName || '',
      lastName: row.lastName || '',
      role: row.role || 'employee',
      teamleadUsername: row.teamleadUsername || null,
      vacationDays: row.vacationDays || 30
    }))
    
    toast.success(t('admin.fileLoaded', { count: previewData.value.length }))
  } catch (err: any) {
    console.error('File parsing error:', err)
    toast.error(t('admin.fileParseError'))
    previewData.value = []
  }
}

// Benutzer importieren
const importUsers = async () => {
  importing.value = true
  importResult.value = null
  
  try {
    const response = await $fetch('/api/admin/import-users', {
      method: 'POST',
      body: { users: previewData.value }
    })
    
    importResult.value = {
      success: true,
      message: t('admin.importSuccessMessage', { count: response.imported }),
      details: response.details
    }
    
    toast.success(t('admin.usersImported', { count: response.imported }))
    
    // Automatischer PDF-Report
    if (response.imported > 0 && response.details && response.details.length > 0) {
      await generatePasswordPDF(response.details)
    }
    
    selectedFile.value = null
    previewData.value = []
    if (fileInput.value) fileInput.value.value = ''
  } catch (err: any) {
    console.error('Import Fehler:', err)
    importResult.value = {
      success: false,
      message: err.data?.message || t('admin.importErrorMessage'),
      details: err.data?.errors
    }
    toast.error(t('admin.importFailed'))
  } finally {
    importing.value = false
  }
}

// PDF Report generieren
const generatePasswordPDF = async (details: string[]) => {
  const userData = details
    .filter(d => d.includes('Passwort:'))
    .map(detail => {
      const match = detail.match(/^(.+?):\s*Importiert\s*\(Passwort:\s*(.+?)\)/)
      if (match) {
        const username = match[1].trim()
        const password = match[2].trim()
        const user = previewData.value.find((u: any) => u.username === username)
        
        return {
          username,
          password,
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          displayName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          role: user?.role || 'employee',
          vacationDays: user?.vacationDays || 30,
          teamleadUsername: user?.teamleadUsername || null
        }
      }
      return null
    })
    .filter(Boolean)
  
  if (userData.length === 0) return
  
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })
  
  userData.forEach((user: any, index: number) => {
    if (index > 0) doc.addPage()
    
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Willkommen im Urlaubsverwaltungssystem', 105, 20, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Login-Informationen für neuen Mitarbeiter', 105, 30, { align: 'center' })
    
    doc.setLineWidth(0.5)
    doc.line(20, 35, 190, 35)
    
    let y = 50
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Ihre Zugangsdaten:', 20, y)
    
    y += 15
    doc.setFontSize(12)
    
    doc.setFont('helvetica', 'bold')
    doc.text('Name:', 30, y)
    doc.setFont('helvetica', 'normal')
    doc.text(user.displayName, 80, y)
    y += 10
    
    doc.setFont('helvetica', 'bold')
    doc.text('Benutzername:', 30, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(14)
    doc.text(user.username, 80, y)
    doc.setFontSize(12)
    y += 10
    
    doc.setFont('helvetica', 'bold')
    doc.text('Passwort:', 30, y)
    doc.setFont('courier', 'normal')
    doc.setFontSize(14)
    doc.text(user.password, 80, y)
    doc.setFontSize(12)
    y += 15
    
    const roleLabels = {
      employee: 'Mitarbeiter',
      teamlead: 'Teamleiter',
      office: 'Büro',
      manager: 'Manager',
      sysadmin: 'System Administrator'
    }
    
    doc.setFont('helvetica', 'bold')
    doc.text('Ihre Rolle:', 30, y)
    doc.setFont('helvetica', 'normal')
    doc.text(roleLabels[user.role] || user.role, 80, y)
    y += 10
    
    doc.setFont('helvetica', 'bold')
    doc.text('Urlaubstage pro Jahr:', 30, y)
    doc.setFont('helvetica', 'normal')
    doc.text(`${user.vacationDays} Tage`, 80, y)
    
    if (user.teamleadUsername) {
      y += 10
      doc.setFont('helvetica', 'bold')
      doc.text('Ihr Teamleiter:', 30, y)
      doc.setFont('helvetica', 'normal')
      doc.text(user.teamleadUsername, 80, y)
    }
    
    y += 25
    doc.setLineWidth(0.5)
    doc.line(20, y, 190, y)
    y += 10
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('So melden Sie sich an:', 20, y)
    
    y += 15
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    
    const instructions = [
      '1. Öffnen Sie die Urlaubsverwaltung im Browser',
      '2. Geben Sie Ihren Benutzernamen ein',
      '3. Geben Sie Ihr Passwort ein (bitte ändern Sie es nach der ersten Anmeldung)',
      '4. Klicken Sie auf "Anmelden"'
    ]
    
    instructions.forEach(instruction => {
      doc.text(instruction, 30, y)
      y += 8
    })
    
    y += 10
    doc.setFillColor(255, 243, 205)
    doc.rect(20, y - 5, 170, 25, 'F')
    doc.setFont('helvetica', 'bold')
    doc.text('WICHTIG:', 25, y + 2)
    doc.setFont('helvetica', 'normal')
    doc.text('Bitte bewahren Sie diese Zugangsdaten sicher auf', 25, y + 9)
    doc.text('und ändern Sie Ihr Passwort nach der ersten Anmeldung!', 25, y + 16)
    
    doc.setFontSize(9)
    doc.setTextColor(128, 128, 128)
    doc.text('Erstellt am: ' + new Date().toLocaleDateString('de-DE'), 105, 280, { align: 'center' })
    doc.text(`Seite ${index + 1} von ${userData.length}`, 190, 285, { align: 'right' })
  })
  
  const pdfBlob = doc.output('blob')
  const pdfUrl = URL.createObjectURL(pdfBlob)
  window.open(pdfUrl, '_blank')
  
  toast.success(`PDF Report mit ${userData.length} Benutzer${userData.length > 1 ? 'n' : ''} erstellt`)
  setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000)
}

// Helper
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('de-DE')
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

onMounted(() => {
  $fetch('/api/admin/backup/last').then(data => {
    lastBackup.value = data
  }).catch(() => {})
})
</script>
