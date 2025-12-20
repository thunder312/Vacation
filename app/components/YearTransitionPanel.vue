<template>
    <!-- Collapsible Header -->
    <div class="section-header" @click="toggleSection">
      <h3>
        <span class="toggle-icon">{{ showSection ? '▼' : '▶' }}</span>
        Jahreswechsel
        <div v-if="transitionStatus?.needed">
          ⚠️
        </div>
        <div v-else>
          ✅
        </div>
      </h3>
      <p v-if="!showSection" class="description-collapsed">
        Urlaubstage für das neue Jahr vorbereiten
      </p>
    </div>

    <!-- Collapsible Content -->
    <div v-show="showSection" class="section-content">
      <p class="description">
        Urlaubstage für das neue Jahr vorbereiten. Alle verbleibenden Tage werden übertragen.
      </p>

      <!-- Status Card -->
      <div v-if="transitionStatus" class="status-card">
        <div v-if="transitionStatus.needed" class="alert alert-warning">
          <strong>⚠️ Jahreswechsel ausstehend!</strong>
          <p>
            Letzter Jahreswechsel: {{ transitionStatus.lastYear }}<br>
            Aktuelles Jahr: {{ transitionStatus.currentYear }}
          </p>
        </div>
        <div v-else class="alert alert-success">
          <strong>✅ Jahreswechsel durchgeführt</strong>
          <p>Jahreswechsel für {{ transitionStatus.currentYear }} bereits abgeschlossen.</p>
        </div>
      </div>

      <!-- Preview Button -->
      <div class="action-buttons">
        <button 
          @click="loadPreview" 
          class="btn btn-primary"
          :disabled="loading"
        >
          {{ loading ? 'Lädt...' : '🔍 Jahreswechsel-Preview anzeigen' }}
        </button>
      </div>
    </div>

    <!-- Preview Modal -->
    <div v-if="showPreview" class="modal-overlay" @click.self="closePreview">
      <div class="modal-content large">
        <div class="modal-header">
          <h2>Jahreswechsel {{ new Date().getFullYear() }} - Preview</h2>
          <button @click="closePreview" class="modal-close">✕</button>
        </div>

        <div class="modal-body">
          <div class="info-box">
            <strong>ℹ️ Was passiert beim Jahreswechsel?</strong>
            <ul>
              <li>Verbleibende Urlaubstage werden berechnet</li>
              <li>Alle verbleibenden Tage werden ins neue Jahr übertragen</li>
              <li>Jeder Mitarbeiter erhält seine Standard-Urlaubstage (meist 30)</li>
              <li>Alte Urlaubsdaten bleiben erhalten (nur zur Historie)</li>
            </ul>
          </div>

          <div v-if="preview.length === 0" class="empty-state">
            Keine aktiven Mitarbeiter gefunden.
          </div>

          <div v-else class="preview-table-wrapper">
            <table class="preview-table">
              <thead>
                <tr>
                  <th>Mitarbeiter</th>
                  <th colspan="3">Aktuell ({{ new Date().getFullYear() - 1 }})</th>
                  <th colspan="3">Neu ({{ new Date().getFullYear() }})</th>
                </tr>
                <tr class="sub-header">
                  <th></th>
                  <th>Standard</th>
                  <th>Übertrag</th>
                  <th>Verbleibend</th>
                  <th>Standard</th>
                  <th>Übertrag</th>
                  <th>Gesamt</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in preview" :key="user.userId">
                  <td><strong>{{ user.displayName }}</strong></td>
                  <!-- Aktuell -->
                  <td>{{ user.current.standard }}</td>
                  <td>{{ user.current.carryover }}</td>
                  <td :class="{ 'text-success': user.current.remaining > 0, 'text-danger': user.current.remaining < 0 }">
                    {{ user.current.remaining }}
                  </td>
                  <!-- Neu -->
                  <td>{{ user.new.standard }}</td>
                  <td :class="{ 'highlight': user.new.carryover > 0 }">
                    {{ user.new.carryover }}
                  </td>
                  <td class="total">{{ user.new.total }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="summary-box">
            <strong>Zusammenfassung:</strong>
            <p>{{ preview.length }} Mitarbeiter werden aktualisiert.</p>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closePreview" class="btn btn-secondary">
            Abbrechen
          </button>
          <button 
            @click="confirmTransition" 
            class="btn btn-save"
            :disabled="executing"
          >
            {{ executing ? 'Wird durchgeführt...' : '✅ Jahreswechsel durchführen' }}
          </button>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
const { checkYearTransitionNeeded, getYearTransitionPreview, executeYearTransition } = useYearTransition()
const toast = useToast()

const showSection = ref(false)
const loading = ref(false)
const executing = ref(false)
const showPreview = ref(false)
const transitionStatus = ref<any>(null)
const preview = ref<any[]>([])

const toggleSection = () => {
  showSection.value = !showSection.value
}

// Status beim Laden prüfen
onMounted(async () => {
  transitionStatus.value = await checkYearTransitionNeeded()
})

const loadPreview = async () => {
  loading.value = true
  try {
    preview.value = await getYearTransitionPreview()
    showPreview.value = true
  } catch (error) {
    console.error('Fehler beim Laden der Preview:', error)
    toast.error('Fehler beim Laden der Preview')
  } finally {
    loading.value = false
  }
}

const closePreview = () => {
  showPreview.value = false
}

const confirmTransition = async () => {
  const confirmed = confirm(
    `⚠️ WICHTIG: Jahreswechsel für ${new Date().getFullYear()} durchführen?\n\n` +
    `Dies wird die Urlaubstage für ${preview.value.length} Mitarbeiter aktualisieren.\n\n` +
    `Diese Aktion kann nicht rückgängig gemacht werden!`
  )

  if (!confirmed) return

  executing.value = true
  try {
    const result = await executeYearTransition()
    
    toast.success(
      `✅ Jahreswechsel erfolgreich durchgeführt!\n` +
      `${result.updatedCount} Mitarbeiter aktualisiert.`
    )
    
    // Status aktualisieren
    transitionStatus.value = await checkYearTransitionNeeded()
    showPreview.value = false
    
    // Seite neu laden, um aktuelle Daten zu zeigen
    setTimeout(() => {
      window.location.reload()
    }, 2000)
  } catch (error) {
    console.error('Fehler beim Jahreswechsel:', error)
    toast.error('❌ Fehler beim Jahreswechsel. Bitte Logs prüfen.')
  } finally {
    executing.value = false
  }
}
</script>

<style scoped>
.year-transition-section {
  background: white;
  border-radius: 12px;
  padding: 0;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header:hover {
  background-color: var(--color-gray-50);
}

.section-header h3 {
  margin: 0 0 4px;
  font-size: 20px;
  color: var(--color-gray-900);
  display: flex;
  align-items: center;
  gap: 8px;
}

.description {
  margin: 0 0 20px 20px;
  color: var(--color-gray-600);
  font-size: 14px;
}

.description-collapsed {
  margin-left: 20px;
  color: var(--color-gray-500);
  font-size: 13px;
}

.status-card {
  margin: 20px 0;
}

.alert {
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid;
}

.alert-warning {
  background: #fff3cd;
  border-color: #ffc107;
  color: #856404;
}

.alert-success {
  background: #d4edda;
  border-color: #28a745;
  color: #155724;
}

.alert strong {
  display: block;
  margin-bottom: 8px;
}

.alert p {
  margin: 4px 0 0;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
}

.btn-secondary {
  background: var(--color-gray-200);
  color: var(--color-gray-700);
}

.btn-secondary:hover {
  background: var(--color-gray-300);
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-content.large {
  background: white;
  border-radius: 12px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--color-gray-500);
  padding: 0;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.info-box {
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.info-box strong {
  display: block;
  margin-bottom: 8px;
  color: #1976d2;
}

.info-box ul {
  margin: 8px 0 0;
  padding-left: 20px;
}

.info-box li {
  margin: 4px 0;
  color: #1565c0;
}

.preview-table-wrapper {
  overflow-x: auto;
  margin: 20px 0;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.preview-table th {
  background: var(--color-gray-100);
  padding: 12px 8px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid var(--color-gray-300);
}

.preview-table .sub-header th {
  background: var(--color-gray-50);
  font-size: 12px;
  font-weight: 500;
  color: var(--color-gray-600);
}

.preview-table td {
  padding: 10px 8px;
  border-bottom: 1px solid var(--color-gray-200);
}

.preview-table tbody tr:hover {
  background: var(--color-gray-50);
}

.text-success {
  color: #28a745;
  font-weight: 600;
}

.text-danger {
  color: #dc3545;
  font-weight: 600;
}

.highlight {
  background: #fff3cd;
  font-weight: 600;
}

.total {
  font-weight: 700;
  color: var(--color-primary);
}

.summary-box {
  background: var(--color-gray-50);
  padding: 16px;
  border-radius: 8px;
  margin-top: 20px;
}

.summary-box strong {
  display: block;
  margin-bottom: 8px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--color-gray-200);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--color-gray-500);
}
</style>
