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
  gap: 6px;
  align-items: center;
}

.lang-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  font-weight: 500;
  min-width: 60px;
  justify-content: center;
}

.lang-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.5);
}

.lang-btn.active {
  background: white;
  color: var(--color-primary);
  border-color: white;
  font-weight: 600;
}

.lang-flag {
  font-size: 16px;
  line-height: 1;
}

.lang-code {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* Responsive */
@media (max-width: 768px) {
  .lang-code {
    display: none;
  }
  
  .lang-btn {
    min-width: 40px;
    padding: 8px;
  }
  
  .lang-flag {
    font-size: 18px;
  }
}
</style>
