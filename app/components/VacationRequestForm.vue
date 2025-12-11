<template>
  <div class="request-form-container">
    <h2>Neuer Urlaubsantrag</h2>
    <form @submit.prevent="handleSubmit" class="request-form">
      <div class="form-row">
        <div class="form-group">
          <label>Von</label>
          <input v-model="startDate" type="date" required />
        </div>
        <div class="form-group">
          <label>Bis</label>
          <input v-model="endDate" type="date" required />
        </div>
      </div>

      <div class="form-group">
        <label>Grund / Bemerkung</label>
        <textarea v-model="reason" rows="3" placeholder="Optional"></textarea>
      </div>

      <button type="submit" class="submit-btn">Antrag einreichen</button>
    </form>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  submit: [startDate: string, endDate: string, reason: string]
}>()

const startDate = ref('')
const endDate = ref('')
const reason = ref('')

const handleSubmit = () => {
  emit('submit', startDate.value, endDate.value, reason.value)

  // Formular zurücksetzen
  startDate.value = ''
  endDate.value = ''
  reason.value = ''
}
</script>

<style scoped>
.request-form-container {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
}

.request-form-container h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
}
</style>