<template>
  <div class="home-container">
    <div class="welcome-box">
      <div class="icon">✓</div>
      <h1>Erfolgreich eingeloggt!</h1>
      <p>Willkommen zurück. Dein Login war erfolgreich.</p>

      <div class="info-section">
        <div class="info-card">
          <h3>Dashboard</h3>
          <p>Hier könnte dein Dashboard sein</p>
        </div>

        <div class="info-card">
          <h3>Profil</h3>
          <p>Verwalte deine Einstellungen</p>
        </div>

        <div class="info-card">
          <h3>Einstellungen</h3>
          <p>Passe deine Präferenzen an</p>
        </div>
      </div>

      <button @click="logout" class="btn-primary">Abmelden</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const logout = () => {
  navigateTo('/login')
}
</script>
