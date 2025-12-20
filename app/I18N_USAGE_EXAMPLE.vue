<!-- BEISPIEL: login.vue mit i18n -->

<template>
  <div class="login-container">
    <div class="login-wrapper">
      <img :src="branding.logo.main" :alt="`${branding.company.name} logo`" class="login-logo" />
      <div class="login-box">
        <!-- VORHER: Hardcoded -->
        <!-- <h1>Login</h1> -->
        
        <!-- NACHHER: Mit i18n -->
        <h1>{{ t('login.title') }}</h1>
        
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <!-- VORHER: -->
            <!-- <label for="username">Benutzername</label> -->
            
            <!-- NACHHER: -->
            <label for="username">{{ t('login.username') }}</label>
            
            <input
                id="username"
                v-model="username"
                type="text"
                :class="{ error: hasError }"
                :placeholder="t('login.usernamePlaceholder')"
                required
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
            />
          </div>

          <button type="submit" :disabled="pending" class="btn-primary">
            {{ pending ? t('common.loading') : t('login.loginButton') }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { branding } from '~/config/branding'
const { t } = useI18n()  // ← WICHTIG: i18n verwenden

const username = ref('')
const password = ref('')
const hasError = ref(false)
const errorMessage = ref('')
const pending = ref(false)

const handleLogin = async () => {
  pending.value = true
  // ... login logic
}
</script>

<!-- 
ERGEBNIS:

Wenn Sprache = DE:
- Login
- Benutzername
- Benutzername eingeben

Wenn Sprache = EN:
- Login
- Username
- Enter username

Wenn Sprache = PT-BR:
- Login
- Nome de usuário
- Digite o nome de usuário
-->
