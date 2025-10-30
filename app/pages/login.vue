<script setup>

const user = useSupabaseUser()
const client = useSupabaseClient()

// Beispiel für Login
async function login() {
  const { data, error } = await client.auth.signInWithPassword({
    email: 'example@email.com',
    password: 'example-password',
  })
}

// Beispiel für Logout
async function logout() {
  const { error } = await client.auth.signOut()
}
</script>

<template>
  <div v-if="user">
    Willkommen, {{ user.email }}!
    <button @click="logout">Logout</button>
  </div>
  <div v-else>
    <button @click="login">Login</button>
  </div>
</template>