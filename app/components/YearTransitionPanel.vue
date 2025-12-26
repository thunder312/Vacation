<template>
    <div class="section-header" @click="toggleSection">
      <h3>
        <span class="toggle-icon">{{ showSection ? '▼' : '▶' }}</span>
        Jahreswechsel
        <div v-if="transitionStatus?.needed">⚠️</div>
        <div v-else>{{icons.actions.reject}}</div>
      </h3>
      <p v-if="!showSection" class="description-collapsed">
        {{ t('vacation.vacationDays') }} für das neue Jahr vorbereiten
      </p>
    </div>

    <div v-show="showSection" class="section-content">
      <p class="description">
        {{ t('vacation.vacationDays') }} für das neue Jahr vorbereiten. Alle verbleibenden {{ t('common.days') }} werden übertragen.
      </p>

      <div v-if="transitionStatus" class="status-card">
        <div v-if="transitionStatus.needed" class="alert alert-warning">
          <strong>⚠️ Jahreswechsel ausstehend!</strong>
          <p>
            Letzter Jahreswechsel: {{ transitionStatus.lastYear }}<br>
            Aktuelles Jahr: {{ transitionStatus.currentYear }}
          </p>
        </div>
        <div v-else class="alert alert-success">
          <strong>{{icons.actions.reject}} Jahreswechsel durchgeführt</strong>
          <p>Jahreswechsel für {{ transitionStatus.currentYear }} bereits abgeschlossen.</p>
        </div>
      </div>

      <div class="action-buttons">
        <button 
          @click="loadPreview" 
          class="btn btn-primary"
          :disabled="loading"
        >
          {{ loading ? t('common.loading') : icons.actions.search+ 'Jahreswechsel-Preview anzeigen' }}
        </button>
      </div>
    </div>

    <div v-if="showPreview" class="modal-overlay" @click.self="closePreview">
      <div class="modal-content large">
        <div class="modal-header">
          <h2>Jahreswechsel {{ new Date().getFullYear() }} - Preview</h2>
          <button @click="closePreview" class="modal-close">✕</button>
        </div>

        <div class="modal-body">
          <div class="info-box">
            <strong>{{`icons.ui.info`}} Was passiert beim Jahreswechsel?</strong>
            <ul>
              <li>Verbleibende {{ t('vacation.vacationDays') }} werden berechnet</li>
              <li>Alle verbleibenden {{ t('common.days') }} werden ins neue Jahr übertragen</li>
              <li>Jeder {{ t('organization.employee') }} erhält seine Standard-{{ t('vacation.vacationDays') }} (meist 30)</li>
              <li>Alte Urlaubsdaten bleiben erhalten (nur zur Historie)</li>
            </ul>
          </div>

          <div v-if="preview.length === 0" class="empty-state">
            Keine aktiven {{ t('organization.employees') }} gefunden.
          </div>

          <div v-else class="preview-table-wrapper">
            <table class="preview-table">
              <thead>
                <tr>
                  <th>{{ t('organization.employee') }}</th>
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
                  <td>{{ user.current.standard }}</td>
                  <td>{{ user.current.carryover }}</td>
                  <td :class="{ 'text-success': user.current.remaining > 0, 'text-danger': user.current.remaining < 0 }">
                    {{ user.current.remaining }}
                  </td>
                  <td>{{ user.next.standard }}</td>
                  <td class="text-info">{{ user.next.carryover }}</td>
                  <td class="text-success"><strong>{{ user.next.total }}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="action-buttons">
            <button @click="closePreview" class="btn btn-secondary">
              {{ t('common.cancel') }}
            </button>
            <button 
              @click="executeTransition" 
              class="btn btn-danger"
              :disabled="executing"
            >
              {{ executing ? icons.ui.loading + ' Wird ausgeführt...' : icons.actions.reject + ' Jahreswechsel durchführen' }}
            </button>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">

import { icons } from '~/config/icons'

const { t } = useI18n()
const toast = useToast()

const showSection = ref(false)
const loading = ref(false)
const executing = ref(false)
const showPreview = ref(false)
const transitionStatus = ref<any>(null)
const preview = ref<any[]>([])

const toggleSection = () => {
  showSection.value = !showSection.value
  if (showSection.value && !transitionStatus.value) {
    loadStatus()
  }
}

const loadStatus = async () => {
  try {
    const data = await $fetch('/api/year-transition/status')
    transitionStatus.value = data
  } catch (error) {
    console.error('Fehler:', error)
    toast.error('Fehler beim Laden')
  }
}

const loadPreview = async () => {
  loading.value = true
  try {
    const data = await $fetch('/api/year-transition/preview')
    preview.value = data || []
    showPreview.value = true
  } catch (error) {
    console.error('Fehler:', error)
    toast.error('Fehler beim Laden')
  } finally {
    loading.value = false
  }
}

const closePreview = () => {
  showPreview.value = false
}

const executeTransition = async () => {
  if (!confirm('Möchten Sie den Jahreswechsel wirklich durchführen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
    return
  }

  executing.value = true
  try {
    await $fetch('/api/year-transition/execute', { method: 'POST' })
    toast.success('Jahreswechsel erfolgreich durchgeführt')
    showPreview.value = false
    await loadStatus()
  } catch (error: any) {
    console.error('Fehler:', error)
    toast.error(error.data?.message || 'Fehler beim Jahreswechsel')
  } finally {
    executing.value = false
  }
}

onMounted(() => {
  loadStatus()
})
</script>
