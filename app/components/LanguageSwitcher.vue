<template>
  <div class="language-dropdown">
    <button @click="toggleDropdown" class="lang-dropdown-btn">
      <span class="current-lang-flag">{{ currentLocale.flag }}</span>
      <span class="current-lang-code">{{ currentLocale.code.toUpperCase() }}</span>
      <span class="dropdown-arrow">▼</span>
    </button>
    
    <div v-if="isOpen" class="lang-dropdown-menu">
      <button 
        v-for="lang in availableLocales" 
        :key="lang.code"
        @click="selectLanguage(lang.code)"
        :class="['lang-option', { active: locale === lang.code }]"
      >
        <span class="lang-flag">{{ lang.flag }}</span>
        <span class="lang-name">{{ lang.name }}</span>
        <span v-if="locale === lang.code" class="checkmark">✓</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale, setLocale, availableLocales } = useI18n()

const isOpen = ref(false)

const currentLocale = computed(() => {
  return availableLocales.find(l => l.code === locale.value) || availableLocales[0]
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectLanguage = async (code: string) => {
  // Sprache wechseln
  setLocale(code as any)
  // Warten bis Vue alle Updates durchgeführt hat
  await nextTick()
  await nextTick() // Zweimal für alle reactive Updates
  // Dann Dropdown schließen
  isOpen.value = false
}

// Click outside to close
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.language-dropdown')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.language-dropdown {
  position: relative;
}

.lang-dropdown-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  font-weight: 500;
  min-width: 80px;
}

.lang-dropdown-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.current-lang-flag {
  font-size: 16px;
}

.current-lang-code {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.dropdown-arrow {
  font-size: 10px;
  margin-left: auto;
  transition: transform 0.2s;
}

.lang-dropdown-btn:hover .dropdown-arrow {
  transform: translateY(1px);
}

.lang-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 160px;
  overflow: hidden;
  z-index: 1000;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.lang-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: white;
  color: var(--color-gray-800);
  cursor: pointer;
  transition: all 0.15s;
  font-size: 14px;
  text-align: left;
}

.lang-option:hover {
  background: var(--color-gray-50);
}

.lang-option.active {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 600;
}

.lang-flag {
  font-size: 18px;
  flex-shrink: 0;
}

.lang-name {
  flex: 1;
}

.checkmark {
  color: var(--color-primary);
  font-weight: bold;
  font-size: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .current-lang-code {
    display: none;
  }
  
  .lang-dropdown-btn {
    min-width: 50px;
    padding: 8px 10px;
  }
}
</style>
