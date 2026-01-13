<template>
  <div class="language-dropdown" ref="dropdownRef">
    <button @click="toggleDropdown" class="lang-dropdown-btn">
      <img :src="getFlagImage(currentCode)" :alt="currentCode" class="current-lang-flag" />
      <span class="current-lang-code">{{ currentCode.toUpperCase() }}</span>
      <span class="dropdown-arrow">{{ isOpen ? (icons.common?.arrowUp || '▲') : (icons.common?.arrowDown || '▼') }}</span>
    </button>
    
    <div v-if="isOpen" class="lang-dropdown-menu">
      <button 
        v-for="lang in languages" 
        :key="lang.code"
        @click="selectLanguage(lang.code)"
        :class="['lang-option', { active: currentCode === lang.code }]"
      >
        <img :src="lang.flagImage" :alt="lang.code" class="lang-flag" />
        <span class="lang-name">{{ lang.name }}</span>
        <span v-if="currentCode === lang.code" class="checkmark">{{ icons.common?.success || '✓' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { icons } from '~/config/icons'

const { locale, saveLocale, loadLocale } = useLocale()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const languages = [
  { 
    code: 'de', 
    name: 'Deutsch',
    flagImage: '/flags/de.png'
  },
  { 
    code: 'en', 
    name: 'English',
    flagImage: '/flags/gb.png'
  },
  { 
    code: 'pt-br', 
    name: 'Português',
    flagImage: '/flags/br.png'
  }
]

const currentCode = computed(() => locale.value || 'de')

const getFlagImage = (code: string) => {
  const lang = languages.find(l => l.code === code)
  return lang?.flagImage || '/flags/de.png'
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectLanguage = (code: string) => {
  saveLocale(code)
  isOpen.value = false
}

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (dropdownRef.value && !dropdownRef.value.contains(target)) {
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
