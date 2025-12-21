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