<!-- Beispiel: About Modal in vacation-updated.vue integrieren -->

<template>
  <div class="vacation-page">
    <!-- Bestehender Header -->
    <div class="page-header">
      <h1>Urlaubsverwaltung</h1>
      
      <div class="header-actions">
        <!-- Bestehende Buttons -->
        <LanguageSwitcher />
        
        <!-- About Button -->
        <button @click="showAbout = true" class="btn-icon" title="Über">
          ℹ️
        </button>
        
        <!-- Logout Button -->
        <button @click="handleLogout" class="btn-danger">
          🚪 Abmelden
        </button>
      </div>
    </div>

    <!-- Restlicher Content -->
    <!-- ... -->

    <!-- About Modal -->
    <AboutModal v-model="showAbout" />
  </div>
</template>

<script setup lang="ts">
// Bestehende Imports
const showAbout = ref(false)
</script>

<!-- ODER: Als globales Modal im Layout -->

<!-- app.vue oder default.vue Layout -->
<template>
  <div>
    <NuxtPage />
    
    <!-- Global About Modal -->
    <AboutModal v-model="showAbout" />
    
    <!-- Global About Button (floating) -->
    <button 
      @click="showAbout = true" 
      class="floating-about-btn"
      title="Über diese Software"
    >
      ℹ️
    </button>
  </div>
</template>

<script setup>
const showAbout = ref(false)
</script>

<style>
.floating-about-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.3s;
  z-index: 1000;
}

.floating-about-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}
</style>
