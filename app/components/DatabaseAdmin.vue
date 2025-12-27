// Nur die Backup-Funktion in DatabaseAdmin.vue ändern:

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
    a.download = filename // Dies triggert "Speichern unter" in modernen Browsern
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
