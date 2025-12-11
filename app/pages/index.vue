<template>
  <div class="home-container">
    <div class="welcome-box">
      <p>Weiterleitung zum Login...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Automatische Weiterleitung zum Login
definePageMeta({
  middleware: () => {
    return navigateTo('/login')
  }
})
</script>
