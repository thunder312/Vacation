<template>
  <div class="request-form-container">
    <h2>{{ t('vacation.newRequest') }}</h2>
    <form @submit.prevent="handleSubmit" class="request-form">
      <div class="form-row">
        <div class="form-group">
          <label>{{ t('common.from') }}</label>
          <input v-model="startDate" type="date" required />
        </div>
        <div class="form-group">
          <label>{{ t('common.to') }}</label>
          <input v-model="endDate" type="date" :placeholder="t('vacation.singleDayHint')" />
          <small class="help-text">{{ t('vacation.singleDayHint') }}</small>
        </div>
      </div>

      <div class="form-group">
        <label>{{ t('common.reason') }} / {{ t('common.remark') }}</label>
        <textarea v-model="reason" rows="3" :placeholder="t('common.optional')"></textarea>
      </div>

      <button type="submit" class="submit-btn">{{ t('vacation.submitRequest') }}</button>
    </form>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const toast = useToast()
const emit = defineEmits<{
  submit: [formData: { startDate: string; endDate: string; reason: string }]
}>()

const startDate = ref('')
const endDate = ref('')
const reason = ref('')

const handleSubmit = () => {
  // Wenn kein Enddatum angegeben, verwende Startdatum (1-Tages-Antrag)
  const effectiveEndDate = endDate.value || startDate.value

  // Validierung: Enddatum darf nicht vor Startdatum liegen
  if (effectiveEndDate < startDate.value) {
    toast.error(t('vacation.invalidDateRange'))
    return
  }

  emit('submit', {
    startDate: startDate.value,
    endDate: effectiveEndDate,
    reason: reason.value
  })

  startDate.value = ''
  endDate.value = ''
  reason.value = ''
}
</script>
