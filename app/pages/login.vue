<template>
  <div class="login-container">
    <div class="login-wrapper">
      <img :src="branding.logo.main" :alt="`${branding.company.name} logo`" class="login-logo" />
      <div class="login-box">
        <h1>{{ t('login.title') }}</h1>
        <form @submit.prevent="handleLogin" autocomplete="off">
          <div class="form-group">
            <label for="username">{{ t('login.username') }}</label>
            <input
                id="username"
                v-model="username"
                type="text"
                :class="{ error: hasError }"
                :placeholder="t('login.usernamePlaceholder')"
                required
                autocomplete="username"
                data-form-type="other"
            />
          </div>

          <div class="form-group">
            <label for="password">{{ t('login.password') }}</label>
            <input
                id="password"
                v-model="password"
                type="password"
                :class="{ error: hasError }"
                :placeholder="t('login.passwordPlaceholder')"
                required
                autocomplete="new-password"
                data-form-type="other"
            />
          </div>

          <button type="submit" class="btn-primary" :disabled="pending">
            {{ pending ? t('common.loading') : t('login.loginButton') }}
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
import { branding } from '~/config/branding'

const { t } = useI18n()
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
      errorMessage.value = t('login.invalidCredentials')
    }
  } catch (err) {
    hasError.value = true
    errorMessage.value = t('login.error')
    console.error('Login error:', err)
  } finally {
    pending.value = false
  }
}
</script>