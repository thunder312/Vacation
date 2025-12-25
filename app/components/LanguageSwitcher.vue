<template>
  <div class="language-dropdown">
    <button @click="toggleDropdown" class="lang-dropdown-btn">
      <span class="current-lang-flag">{{ currentFlag }}</span>
      <span class="current-lang-code">{{ locale.toUpperCase() }}</span>
      <span class="dropdown-arrow">▼</span>
    </button>
    
    <div v-if="isOpen" class="lang-dropdown-menu">
      <button 
        v-for="lang in languages" 
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
const { locale, saveLocale, loadLocale } = useLocale()

const isOpen = ref(false)

const languages = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'pt-br', name: 'Português', flag: '🇧🇷' }
]

const currentFlag = computed(() => {
  const lang = languages.find(l => l.code === locale.value)
  return lang?.flag || '🇩🇪'
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectLanguage = (code: string) => {
  saveLocale(code)
  isOpen.value = false
}

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.language-dropdown')) {
    isOpen.value = false
  }
}

onMounted(() => {
  loadLocale()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
