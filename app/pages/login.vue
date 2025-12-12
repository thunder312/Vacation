<template>
  <div class="login-container">
    <div class="login-wrapper">
      <img src="/Logo_TecKonzept_noBg.png" alt="TecKonzept logo" class="login-logo" />
      <div class="login-box">
        <h1>Login</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Benutzername</label>
          <input
              id="username"
              v-model="username"
              type="text"
              :class="{ error: hasError }"
              placeholder="Benutzername eingeben"
              required
          />
        </div>

        <div class="form-group">
          <label for="password">Passwort</label>
          <input
              id="password"
              v-model="password"
              type="password"
              :class="{ error: hasError }"
              placeholder="Passwort eingeben"
              required
          />
        </div>

        <button type="submit" class="btn-primary" :disabled="pending">
          {{ pending ? 'Prüfe...' : 'Anmelden' }}
        </button>

        <p v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </p>
      </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const username = ref('')
const password = ref('')
const hasError = ref(false)
const errorMessage = ref('')
const pending = ref(false)

const handleLogin = async () => {
  pending.value = true
  hasError.value = false
  errorMessage.value = ''

  try {
    const { data, error } = await useFetch('/api/login', {
      method: 'POST',
      body: {
        username: username.value,
        password: password.value
      }
    })

    if (error.value) {
      hasError.value = true
      errorMessage.value = 'Benutzername oder Passwort falsch'
    } else if (data.value?.success) {
      await navigateTo(`/vacation?role=${data.value.role}&user=${username.value}`, { replace: true })
    }
  } catch (err) {
    hasError.value = true
    errorMessage.value = 'Ein Fehler ist aufgetreten'
  } finally {
    pending.value = false
  }
}
</script>