<template>
  <div class="approved-vacation-list">
    <!-- Header mit Toggle -->
    <div class="section-header" @click="toggleSection">
      <div class="header-left">
        <span class="toggle-icon">{{ showSection ? (icons.ui?.expand || '▼') : (icons.ui?.collapse || '▶') }}</span>
        <h2>Jahreswechsel {{ transitionStatus?.currentYear }}</h2>
        <span v-if="transitionStatus?.needed" class="count-badge info">{{ transitionStatus.currentYear - 1 }} → {{ transitionStatus.currentYear }}</span>
        <span v-else class="count-badge success">{{ icons.yearTransition?.done || '✓' }}</span>
      </div>
      <span class="description-collapsed" v-if="!showSection">
        Resturlaub aus {{ transitionStatus?.lastYear || new Date().getFullYear() - 1 }} ins neue Jahr übertragen
      </span>
    </div>

    <!-- Content (einklappbar) -->
    <div v-show="showSection" class="section-content">
      <p class="description">
        Hier können Sie den Jahreswechsel durchführen und die verbleibenden {{ t('vacation.vacationDays') }} aus dem Vorjahr ins neue Jahr übertragen.
        Zusätzlich können auch die definierten Halbtage ins neue Jahr übertragen werden.
      </p>

      <div v-if="transitionStatus" class="status-card">
        <div v-if="transitionStatus.needed" class="alert alert-info">
          <strong>{{ icons.yearTransition?.info || 'ℹ️' }} Jahreswechsel {{ transitionStatus.currentYear }} möglich</strong>
          <p>
            Resturlaub aus {{ transitionStatus.lastYear }} kann nach {{ transitionStatus.currentYear }} übertragen werden.<br>
            <small>Führen Sie den Jahreswechsel durch, sobald alle Urlaube aus {{ transitionStatus.lastYear }} eingetragen sind.</small>
          </p>
        </div>
        <div v-else class="alert alert-success">
          <strong>{{ icons.yearTransition?.success || '✅' }} Jahreswechsel durchgeführt</strong>
          <p>Resturlaub und Halbtage wurden bereits nach {{ transitionStatus.currentYear }} übertragen.</p>
          <button
            @click="resetTransition"
            class="btn-secondary"
            style="margin-top: 12px;"
            :disabled="resetting"
          >
            {{ resetting ? (icons.common?.loading || '⏳') + ' Wird zurückgesetzt...' : (icons.yearTransition?.reset || '↩️') + ' Jahreswechsel zurücksetzen' }}
          </button>
        </div>
      </div>

      <div class="modal-actions" style="justify-content: flex-start;">
        <button
          @click="loadPreviewUser(); loadPreviewHalfDays()"
          class="btn-primary"
          :disabled="loading || !transitionStatus?.needed"
        >
          {{ loading ? t('common.loading') : (icons.yearTransition?.preview || '🔍') + ' Vorschau anzeigen' }}
        </button>
      </div>
    </div>

    <div v-if="showPreview" class="modal-overlay" @click.self="closePreview">
      <div class="modal-content large">
        <div class="modal-header">
          <h2>Jahreswechsel {{ new Date().getFullYear() }} - Preview</h2>
          <button @click="closePreview" class="modal-close">{{ icons.yearTransition?.close || '✕' }}</button>
        </div>

        <div class="modal-body">
          <div class="info-box">
            <strong>{{ icons.yearTransition?.info || 'ℹ️' }} Was passiert beim Jahreswechsel?</strong>
            <ul>
              <li>Verbleibende {{ t('vacation.vacationDays') }} werden berechnet</li>
              <li>Alle verbleibenden {{ t('common.days') }} werden ins neue Jahr übertragen</li>
              <li>Jeder {{ t('organization.employee') }} erhält seine Standard-{{ t('vacation.vacationDays') }} (meist 30)</li>
              <li>Alte Urlaubsdaten bleiben erhalten (nur zur Historie)</li>
            </ul>
          </div>

          <div v-if="previewUser.length === 0" class="empty-state">
            Keine aktiven {{ t('organization.employees') }} gefunden.
          </div>

          <div v-else class="preview-table-wrapper">
            <!-- Gemeinsamer Grund für alle -->
            <div class="shared-reason-box">
              <label>{{ t('yearTransition.sharedReason') }}</label>
              <div class="shared-reason-input-row">
                <input
                  type="text"
                  v-model="sharedReason"
                  :placeholder="t('yearTransition.sharedReasonPlaceholder')"
                  class="reason-input"
                />
                <button
                  type="button"
                  class="btn-secondary"
                  @click="applySharedReason"
                  :disabled="!sharedReason.trim()"
                >
                  {{ t('yearTransition.applyToAll') }}
                </button>
              </div>
            </div>

            <table class="preview-table">
              <thead>
                <tr>
                  <th>{{ t('organization.employee') }}</th>
                  <th colspan="3">{{ new Date().getFullYear() - 1 }}</th>
                  <th colspan="2">{{ t('yearTransition.carryoverTo') }} {{ new Date().getFullYear() }}</th>
                  <th>{{ t('yearTransition.reasonOptional') }}</th>
                </tr>
                <tr class="sub-header">
                  <th></th>
                  <th>{{ t('yearTransition.entitlement') }}</th>
                  <th>{{ t('yearTransition.taken') }}</th>
                  <th>{{ t('yearTransition.remaining') }}</th>
                  <th>{{ t('yearTransition.calculated') }}</th>
                  <th>{{ t('yearTransition.adjusted') }}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in previewUser" :key="user.userId">
                  <td><strong>{{ user.displayName }}</strong></td>
                  <td>{{ user.current.total }}</td>
                  <td>{{ user.current.used }}</td>
                  <td :class="{ 'text-success': user.current.remaining > 0, 'text-danger': user.current.remaining < 0 }">
                    {{ user.current.remaining }}
                  </td>
                  <td class="text-muted">{{ user.next.carryover }}</td>
                  <td>
                    <input
                      type="number"
                      v-model.number="adjustmentsVacation[user.userId].days"
                      min="0"
                      step="0.5"
                      class="carryover-input"
                      :class="{ 'modified': adjustmentsVacation[user.userId].days !== user.next.carryover }"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      v-model="adjustmentsVacation[user.userId].reason"
                      :placeholder="adjustmentsVacation[user.userId].days !== user.next.carryover ? t('yearTransition.enterReason') : ''"
                      class="reason-input"
                      :class="{ 'required': adjustmentsVacation[user.userId].days !== user.next.carryover && !adjustmentsVacation[user.userId].reason }"
                    />
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4"></td>
                  <td class="text-muted">{{ totalCalculated }} {{ t('common.days') }}</td>
                  <td class="text-success"><strong>{{ totalAdjusted }} {{ t('common.days') }}</strong></td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
            <!-- Halbtage-->
            <table class="preview-table">
              <thead>
              <tr>
                <th colspan="3">{{ t('yearTransition.halfDays') }}</th>
              </tr>
              <tr class="sub-header">
                <th>{{ t('yearTransition.description') }}</th>
                <th>{{ t('common.date') }}</th>
                <th>{{ t('yearTransition.transfer') }}</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="halfDay in previewHalfDays" :key="halfDay.id">
                <td><strong>{{ halfDay.current.description }}</strong></td>
                <td>{{ formatDate(halfDay.current.date) }} → {{ formatDate(halfDay.next.date) }}</td>
                <td>
                  <input
                      type="checkbox"
                      v-model="adjustmentsHalfDay[halfDay.id].proceed"
                      :disabled="halfDay.alreadyExists"
                      class="reason-input"
                  />
                  <span v-if="halfDay.alreadyExists" class="text-muted" style="margin-left: 8px;">
                    ({{ t('yearTransition.alreadyExists') }})
                  </span>
                </td>
              </tr>
              </tbody>
            </table>
          </div>

          <div class="modal-actions">
            <button @click="closePreview" class="btn-secondary">
              {{ t('common.cancel') }}
            </button>
            <button
              @click="executeTransition"
              class="btn-danger"
              :disabled="executing"
            >
              {{ executing ? (icons.common?.loading || '⏳') + ' Wird ausgeführt...' : (icons.status?.success || '✅') + ' Jahreswechsel durchführen' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { icons } from '~/config/icons'
import { formatDate } from '~/utils/dateHelpers'

const { t } = useI18n()
const toast = useToast()
const { confirm } = useConfirm()
const { fetchHalfDayRules } = useHalfDayRules()

const showSection = ref(false)
const loading = ref(false)
const executing = ref(false)
const resetting = ref(false)
const showPreview = ref(false)
const transitionStatus = ref<any>(null)
const previewUser = ref<any[]>([])
const previewHalfDays = ref<any[]>([])
const adjustmentsVacation = ref<Record<string, { days: number; reason: string }>>({})
const adjustmentsHalfDay = ref<Record<string, { id: number; description: string; date: string; proceed: boolean}>>({})
const sharedReason = ref('')

// Computed: Summe der berechneten Tage
const totalCalculated = computed(() => {
  return previewUser.value.reduce((sum, user) => sum + user.next.carryover, 0)
})

// Computed: Summe der angepassten Tage
const totalAdjusted = computed(() => {
  return Object.values(adjustmentsVacation.value).reduce((sum, adj) => sum + (adj.days || 0), 0)
})

// Gemeinsamen Grund für alle User anwenden
const applySharedReason = () => {
  if (!sharedReason.value.trim()) return

  Object.keys(adjustmentsVacation.value).forEach(userId => {
    adjustmentsVacation.value[userId].reason = sharedReason.value
  })
}

const toggleSection = () => {
  showSection.value = !showSection.value
  if (showSection.value && !transitionStatus.value) {
    loadStatus()
  }
}

const loadStatus = async () => {
  try {
    transitionStatus.value = await $fetch('/api/year-transition/check')
  } catch (error) {
    console.error('Fehler:', error)
    toast.error('Fehler beim Laden')
  }
}

const loadPreviewUser = async () => {
  loading.value = true
  try {
    const data = await $fetch('/api/year-transition/previewUser')
    previewUser.value = data || []

    // Initialisiere AdjustmentsVacation mit berechneten Werten
    adjustmentsVacation.value = {}
    previewUser.value.forEach(user => {
      adjustmentsVacation.value[user.userId] = {
        days: user.next.carryover,
        reason: ''
      }
    })

    showPreview.value = true
  } catch (error) {
    console.error('Fehler:', error)
    toast.error('Fehler beim Laden')
  } finally {
    loading.value = false
  }
}

const loadPreviewHalfDays = async () => {
  loading.value = true
  try {
    const data = await $fetch('/api/year-transition/previewHalfDays')
    console.log('YearTransitionPanel data: ', data);
    previewHalfDays.value = data || []

    // Initialisiere AdjustmentsHalfDay mit dem neuen Datum aus next
    adjustmentsHalfDay.value = {}
    previewHalfDays.value.forEach(halfDay => {
      adjustmentsHalfDay.value[halfDay.id] = {
        id: halfDay.id,
        description: halfDay.current.description,
        date: halfDay.next.date, // Das neue Datum fürs aktuelle Jahr
        proceed: !halfDay.alreadyExists // Default: übernehmen, außer wenn bereits vorhanden
      }
    })

    showPreview.value = true
  } catch (error) {
    console.error('Fehler:', error)
    toast.error('Fehler beim Laden der Halbtage')
  } finally {
    loading.value = false
  }
}

const closePreview = () => {
  showPreview.value = false
}

const executeTransition = async () => {
  // Prüfe ob bei Anpassungen ein Grund angegeben wurde
  const missingReasons = previewUser.value.filter(user => {
    const adj = adjustmentsVacation.value[user.userId]
    return adj.days !== user.next.carryover && !adj.reason.trim()
  })

  if (missingReasons.length > 0) {
    toast.error(`Bitte geben Sie einen Grund an für: ${missingReasons.map(u => u.displayName).join(', ')}`)
    return
  }

  executing.value = true
  try {
    await $fetch('/api/year-transition/execute', {
      method: 'POST',
      body: {
        adjustmentsVacation: adjustmentsVacation.value,
        adjustmentsHalfDay: adjustmentsHalfDay.value
      }
    })
    toast.success('Jahreswechsel erfolgreich durchgeführt')
    showPreview.value = false
    await loadStatus()
    // Halbtage-Liste aktualisieren
    await fetchHalfDayRules()
  } catch (error: any) {
    console.error('Fehler:', error)
    toast.error(error.data?.message || 'Fehler beim Jahreswechsel')
  } finally {
    executing.value = false
  }
}

const resetTransition = async () => {
  const confirmed = await confirm({
    title: t('yearTransition.resetTitle'),
    message: t('yearTransition.resetConfirmMessage'),
    confirmText: t('yearTransition.resetConfirm'),
    type: 'warning'
  })
  if (!confirmed) return

  resetting.value = true
  try {
    await $fetch('/api/year-transition/reset', {
      method: 'POST'
    })
    toast.success('Jahreswechsel wurde zurückgesetzt')
    await loadStatus()
    // Halbtage-Liste aktualisieren (die des aktuellen Jahres wurden gelöscht)
    await fetchHalfDayRules()
  } catch (error: any) {
    console.error('Fehler:', error)
    toast.error(error.data?.message || 'Fehler beim Zurücksetzen')
  } finally {
    resetting.value = false
  }
}

onMounted(() => {
  loadStatus()
})
</script>

<style scoped>
.shared-reason-box {
  background: var(--color-bg-secondary, #f5f5f5);
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.shared-reason-box label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
}

.shared-reason-input-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.shared-reason-input-row .reason-input {
  flex: 1;
}
</style>
