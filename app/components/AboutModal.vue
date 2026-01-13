<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content about-modal">
          <button @click="closeModal" class="modal-close" aria-label="{{ t('common.close') }}">
            {{ icons.modal?.close || '✕' }}
          </button>

          <div class="about-header">
            <div class="about-logo">
              <img :src="branding.logo.main" :alt="`${branding.company.name} logo`" />
            </div>
            <h2>{{ t('about.title', { appName: branding.app.fullName }) }}</h2>
            <p class="version">{{ t('about.version', { version: branding.app.version }) }}</p>
          </div>

          <div class="about-body">
            <!-- Credits - Kompakt -->
            <section class="about-section credits">
              <h3>{{ icons.about?.developer || '👨‍💻' }} {{ t('about.developedBy') }}</h3>
              
              <div class="credits-grid">
                <!-- Daniel Ertl -->
                <div class="credit-card compact">
                  <div class="credit-avatar small">
                    <div class="avatar-circle">
                      <span class="avatar-initials">DE</span>
                    </div>
                  </div>
                  <div class="credit-info">
                    <h4>Daniel Ertl</h4>
                    <p class="credit-role">{{ t('about.leadDeveloper') }}</p>
                    <a 
                      href="https://github.com/thunder312" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="credit-link"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                      </svg>
                      github.com/thunder312
                    </a>
                    <a
                        href="https://buymeacoffee.com/dertl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="credit-link"
                    >
                      <img scr="app/assets/buyMeACoffee.png"/>Buy me a coffee
                    </a>
                  </div>
                </div>

                <!-- Claude -->
                <div class="credit-card compact ai">
                  <div class="credit-avatar small">
                    <div class="avatar-circle ai-avatar">
                      <span class="avatar-initials">AI</span>
                    </div>
                  </div>
                  <div class="credit-info">
                    <h4>Claude</h4>
                    <p class="credit-role">{{ t('about.aiAssistant') }}</p>
                    <a 
                      href="https://claude.ai" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="credit-link"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0L0 8l8 8 8-8-8-8zm0 2.5L13.5 8 8 13.5 2.5 8 8 2.5z"/>
                      </svg>
                      claude.ai
                    </a>
                  </div>
                </div>
              </div>
            </section>

            <!-- Technologie Stack - Kompakt -->
            <section class="about-section tech-stack">
              <h3>{{ icons.about?.tools || '🛠️' }} {{ t('about.techStack') }}</h3>
              <div class="tech-grid compact">
                <div class="tech-item">
                  <span class="tech-icon">{{ icons.about?.nuxt || '⚡' }}</span>
                  <span class="tech-name">Nuxt 3</span>
                </div>
                <div class="tech-item">
                  <span class="tech-icon">{{ icons.about?.css || '🎨' }}</span>
                  <span class="tech-name">Vue 3</span>
                </div>
                <div class="tech-item">
                  <span class="tech-icon">{{ icons.about?.typescript || '📘' }}</span>
                  <span class="tech-name">TypeScript</span>
                </div>
                <div class="tech-item">
                  <span class="tech-icon">{{ icons.about?.database || '🗄️' }}</span>
                  <span class="tech-name">SQLite</span>
                </div>
                <div class="tech-item">
                  <span class="tech-icon">{{ icons.ui?.document || '📄' }}</span>
                  <span class="tech-name">jsPDF</span>
                </div>
                <div class="tech-item">
                  <span class="tech-icon">{{ icons.about?.i18n || '🌍' }}</span>
                  <span class="tech-name">i18n</span>
                </div>
              </div>
            </section>

            <!-- Footer -->
            <section class="about-footer">
              <p class="copyright">
                {{ t('about.copyright', { year: currentYear, company: branding.company.name }) }}
              </p>
              <p class="built-with">
                {{ t('about.madeWith') }}
              </p>
            </section>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { branding } from '~/config/branding'
import { icons } from '~/config/icons'
const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const closeModal = () => {
  emit('update:modelValue', false)
}

const currentYear = new Date().getFullYear()

// ESC-Key Handler
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.modelValue) {
      closeModal()
    }
  }
  window.addEventListener('keydown', handleEscape)
  onUnmounted(() => {
    window.removeEventListener('keydown', handleEscape)
  })
})
</script>