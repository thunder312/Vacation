<!-- pages/index.vue -->
<template>
  <div>
    <h1>Willkommen zur Startseite</h1>
    <div v-if="user">
      <p>Hallo, {{ user.email }}!</p>
      <button @click="handleLogout">Ausloggen</button>
    </div>
    <div v-else>
      <p>Sie sind nicht eingeloggt.</p>
      <NuxtLink to="/login">Zum Login</NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useSupabaseUser, useSupabaseAuthClient } from '#imports'
import { useRouter } from 'vue-router'

const user = useSupabaseUser()
const client = useSupabaseAuthClient()
const router = useRouter()

async function handleLogout() {
  try {
    const { error } = await client.auth.signOut()
    if (error) throw error
    // Optional: Redirect to login page after logout
    router.push('/login')
  } catch (error) {
    console.error('Fehler beim Ausloggen:', error.message)
  }
}
</script>

<style scoped>
div {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

h1 {
  color: #2c3e50;
}

button {
  background-color: #3498db;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
}

button:hover {
  background-color: #2980b9;
}

a {
  color: #3498db;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
