<template>
  <div class="login-container">
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

        <button type="submit" :disabled="loading">
          {{ loading ? 'Prüfe...' : 'Anmelden' }}
        </button>

        <p v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
const username = ref('')
const password = ref('')
const hasError = ref(false)
const errorMessage = ref('')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  hasError.value = false
  errorMessage.value = ''

  try {
    // API-Aufruf zum Validieren der Zugangsdaten
    const response = await $fetch('/api/login', {
      method: 'POST',
      body: {
        username: username.value,
        password: password.value
      }
    })

    if (response.success) {
      // Erfolgreicher Login - weiterleiten
      await navigateTo('/')
    }
  } catch (error) {
    // Fehler beim Login
    hasError.value = true
    errorMessage.value = 'Benutzername oder Passwort falsch'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  background: white;
  padding: 2.5rem;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

h1 {
  margin: 0 0 1.5rem 0;
  color: #333;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

input.error {
  border-color: #e74c3c;
  background-color: #ffe6e6;
}

button {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

button:hover:not(:disabled) {
  transform: translateY(-2px);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  text-align: center;
  margin-top: 1rem;
  font-weight: 500;
}
</style>