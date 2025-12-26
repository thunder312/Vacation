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
          <input v-model="endDate" type="date" required />
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
const emit = defineEmits<{
  submit: [formData: { startDate: string; endDate: string; reason: string }]
}>()

const startDate = ref('')
const endDate = ref('')
const reason = ref('')

const handleSubmit = () => {
  emit('submit', {
    startDate: startDate.value,
    endDate: endDate.value,
    reason: reason.value
  })

  startDate.value = ''
  endDate.value = ''
  reason.value = ''
}
</script>
