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
                placeholder="Nachname (oder admin/office)"
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
const { login } = useAuth()

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
    const success = await login(username.value, password.value)
    
    if (success) {
      await navigateTo('/vacation', { replace: true })
    } else {
      hasError.value = true
      errorMessage.value = 'Benutzername oder Passwort falsch'
    }
  } catch (err) {
    hasError.value = true
    errorMessage.value = 'Ein Fehler ist aufgetreten'
    console.error('Login error:', err)
  } finally {
    pending.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  padding: var(--spacing-md);
}

.login-wrapper {
  width: 100%;
  max-width: 400px;
}

.login-logo {
  display: block;
  width: 150px;
  height: auto;
  margin: 0 auto var(--spacing-xl);
}

.login-box {
  background: var(--color-white);
  padding: var(--spacing-2xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
}

.login-box h1 {
  margin: 0 0 var(--spacing-xl);
  color: var(--color-gray-800);
  text-align: center;
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-xs);
  color: var(--color-gray-700);
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-group input.error {
  border-color: var(--color-error);
}

.btn-primary {
  width: 100%;
  padding: var(--spacing-md);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  margin-top: var(--spacing-md);
  color: var(--color-error);
  text-align: center;
  font-size: 0.875rem;
}
</style>
