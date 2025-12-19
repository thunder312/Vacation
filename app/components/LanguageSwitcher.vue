<template>
  <div class="language-switcher">
    <button 
      v-for="lang in availableLocales" 
      :key="lang.code"
      @click="setLocale(lang.code)"
      :class="['lang-btn', { active: locale === lang.code }]"
      :title="lang.name"
    >
      <span class="lang-flag">{{ lang.flag }}</span>
      <span class="lang-code">{{ lang.code.toUpperCase() }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
const { locale, setLocale, availableLocales, initLocale } = useI18n()

// Sprache beim Mounting initialisieren
onMounted(() => {
  initLocale()
})
</script>

<style scoped>
.language-switcher {
  display: flex;
  gap: 8px;
  align-items: center;
}

.lang-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 2px solid transparent;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
}

.lang-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.lang-btn.active {
  background: white;
  color: var(--color-primary);
  border-color: white;
}

.lang-flag {
  font-size: 18px;
  line-height: 1;
}

.lang-code {
  font-size: 12px;
  font-weight: 600;
}

/* Für helle Hintergründe */
.light-bg .lang-btn {
  background: var(--color-gray-100);
  color: var(--color-gray-800);
  border-color: var(--color-gray-300);
}

.light-bg .lang-btn:hover {
  background: var(--color-gray-200);
}

.light-bg .lang-btn.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}
</style>
