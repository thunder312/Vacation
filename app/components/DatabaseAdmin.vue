<template>
  <div class="database-admin">
    <div class="admin-header">
      <h2>🗄️ {{ t('admin.database') }}</h2>
      <p class="description">{{ t('admin.databaseDescription') }}</p>
    </div>

    <!-- Backup Section -->
    <div class="admin-card">
      <h3>💾 {{ t('admin.databaseBackup') }}</h3>
      <p>{{ t('admin.backupDescription') }}</p>
      <div class="backup-actions">
        <button @click="createAndDownloadBackup" class="btn-primary" :disabled="creating">
          {{ creating ? '⏳ ' + t('admin.creating') : '💾 ' + t('admin.createBackup') }}
        </button>
      </div>
      <div v-if="lastBackup" class="backup-info">
        <small>{{ t('admin.lastBackup') }}: {{ formatDate(lastBackup.date) }} ({{ formatFileSize(lastBackup.size) }})</small>
      </div>
    </div>

    <!-- Clear Database Section -->
    <div class="admin-card danger-zone">
      <h3>🗑️ {{ t('admin.clearDatabase') }}</h3>
      <p class="warning-text">⚠️ {{ t('admin.clearWarning') }}</p>
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
          {{ clearing ? '⏳ ' + t('admin.clearing') : '🗑️ ' + t('admin.clearDatabaseBtn') }}
        </button>
      </div>
    </div>

    <!-- Import Users Section -->
    <div class="admin-card">
      <h3>📊 {{ t('admin.importUsers') }}</h3>
      <p>{{ t('admin.importDescription') }}</p>
      
      <!-- Template Download -->
      <div class="import-step">
        <h4>1. {{ t('admin.downloadTemplate') }}</h4>
        <button @click="downloadTemplate" class="btn-secondary">
          📥 {{ t('admin.downloadExcelTemplate') }}
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
          📄 {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
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
          {{ importing ? '⏳ ' + t('admin.importing') : '📊 ' + t('admin.importUsersBtn') }}
        </button>
      </div>

      <!-- Import Result -->
      <div v-if="importResult" class="import-result" :class="importResult.success ? 'success' : 'error'">
        <h4>{{ importResult.success ? '✓ ' + t('admin.importSuccess') : '✗ ' + t('admin.importError') }}</h4>
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

const toast = useToast()
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

// Backup erstellen UND direkt herunterladen mit Speichern-Dialog
const createAndDownloadBackup = async () => {
  creating.value = true
  try {
    // Hole SQL-Backup vom Server
    const response = await fetch('/api/admin/backup/download', { 
      method: 'GET',
      headers: {
        'Accept': 'application/sql'
      }
    })
    
    if (!response.ok) {
      throw new Error('Backup failed')
    }
    
    // Hole SQL als Text
    const sqlContent = await response.text()
    
    // Erstelle Blob aus SQL
    const blob = new Blob([sqlContent], { type: 'application/sql' })
    
    // Generiere Dateinamen mit Timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `vacation-backup-${timestamp}.sql`
    
    // Erstelle Download-Link mit "download" attribute
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.style.display = 'none'
    
    // Trigger Download
    document.body.appendChild(a)
    a.click()
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)
    
    // Update lastBackup Info
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
  if (!confirm(t('admin.clearConfirmDialog'))) return
  
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
    ['max.mustermann', 'Max', 'Mustermann', 'employee', 'anna.schmidt', '30'],
    ['anna.schmidt', 'Anna', 'Schmidt', 'teamlead', '', '30'],
    ['john.doe', 'John', 'Doe', 'manager', '', '30']
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
    
    // Reset
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
  // Lade letzte Backup-Info
  $fetch('/api/admin/backup/last').then(data => {
    lastBackup.value = data
  }).catch(() => {})
})
</script>
