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