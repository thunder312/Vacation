<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content about-modal">
          <button @click="closeModal" class="modal-close" aria-label="Schließen">
            ✕
          </button>

          <div class="about-header">
            <div class="about-logo">
              <img :src="branding.logo.main" :alt="`${branding.company.name} logo`" />
            </div>
            <h2>{{ branding.app.fullName }}</h2>
            <p class="version">Version {{ branding.app.version }}</p>
          </div>

          <div class="about-body">
            <!-- Beschreibung -->
            <section class="about-section">
              <p class="description">
                {{ branding.app.description }}
              </p>
            </section>

            <!-- Credits -->
            <section class="about-section credits">
              <h3>👨‍💻 Entwickelt von</h3>
              
              <!-- Daniel Ertl -->
              <div class="credit-card">
                <div class="credit-avatar">
                  <div class="avatar-circle">
                    <span class="avatar-initials">DE</span>
                  </div>
                </div>
                <div class="credit-info">
                  <h4>Daniel Ertl</h4>
                  <p class="credit-role">Lead Developer & Architect</p>
                  <a 
                    href="https://github.com/thunder312" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="credit-link"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                    </svg>
                    github.com/thunder312
                  </a>
                </div>
              </div>

              <!-- Claude -->
              <div class="credit-card ai">
                <div class="credit-avatar">
                  <div class="avatar-circle ai-avatar">
                    <span class="avatar-initials">AI</span>
                  </div>
                </div>
                <div class="credit-info">
                  <h4>Claude</h4>
                  <p class="credit-role">AI Development Assistant</p>
                  <p class="credit-description">
                    Entwickelt von Anthropic. Unterstützte bei Architektur, 
                    Code-Generierung und Best Practices.
                  </p>
                  <a 
                    href="https://claude.ai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="credit-link"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 0L0 8l8 8 8-8-8-8zm0 2.5L13.5 8 8 13.5 2.5 8 8 2.5z"/>
                    </svg>
                    claude.ai
                  </a>
                </div>
              </div>
            </section>

            <!-- Technologie Stack -->
            <section class="about-section tech-stack">
              <h3>🛠️ Technologie-Stack</h3>
              <div class="tech-grid">
                <div class="tech-item">
                  <span class="tech-icon">⚡</span>
                  <span class="tech-name">Nuxt 3</span>
                </div>
                <div class="tech-item">
                  <span class="tech-icon">🎨</span>
                  <span class="tech-name">Vue 3</span>
                </div>
                <div class="tech-item">
                  <span class="tech-icon">📘</span>
                  <span class="tech-name">TypeScript</span>
                </div>
                <div class="tech-item">
                  <span class="tech-icon">🗄️</span>
                  <span class="tech-name">SQLite</span>
                </div>
                <div class="tech-item">
                  <span class="tech-icon">📄</span>
                  <span class="tech-name">jsPDF</span>
                </div>
                <div class="tech-item">
                  <span class="tech-icon">🌍</span>
                  <span class="tech-name">i18n</span>
                </div>
              </div>
            </section>

            <!-- Footer -->
            <section class="about-footer">
              <p class="copyright">
                © {{ currentYear }} {{ branding.company.name }}. Alle Rechte vorbehalten.
              </p>
              <p class="built-with">
                Erstellt mit ❤️ in Deutschland
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

const isOpen = defineModel<boolean>({ default: false })

const closeModal = () => {
  isOpen.value = false
}

const currentYear = new Date().getFullYear()

// ESC-Key Handler
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen.value) {
      closeModal()
    }
  }
  window.addEventListener('keydown', handleEscape)
  onUnmounted(() => {
    window.removeEventListener('keydown', handleEscape)
  })
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: var(--color-gray-100);
  border-radius: 8px;
  color: var(--color-gray-600);
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 1;
}

.modal-close:hover {
  background: var(--color-gray-200);
  color: var(--color-gray-900);
  transform: scale(1.1);
}

/* Header */
.about-header {
  text-align: center;
  padding: 40px 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px 16px 0 0;
}

.about-logo {
  margin-bottom: 20px;
}

.about-logo img {
  height: 60px;
  filter: brightness(0) invert(1);
}

.about-header h2 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
}

.version {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

/* Body */
.about-body {
  padding: 30px 40px 40px;
}

.about-section {
  margin-bottom: 30px;
}

.about-section:last-child {
  margin-bottom: 0;
}

.description {
  text-align: center;
  color: var(--color-gray-600);
  font-size: 16px;
  line-height: 1.6;
}

.about-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px;
  color: var(--color-gray-800);
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Credits */
.credit-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: var(--color-gray-50);
  border-radius: 12px;
  margin-bottom: 16px;
  transition: all 0.3s;
}

.credit-card:last-child {
  margin-bottom: 0;
}

.credit-card:hover {
  background: var(--color-gray-100);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.credit-card.ai {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
}

.credit-avatar {
  flex-shrink: 0;
}

.avatar-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.ai-avatar {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.avatar-initials {
  user-select: none;
}

.credit-info {
  flex: 1;
}

.credit-info h4 {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-gray-900);
}

.credit-role {
  margin: 0 0 8px;
  color: var(--color-gray-600);
  font-size: 14px;
}

.credit-description {
  margin: 8px 0;
  color: var(--color-gray-600);
  font-size: 14px;
  line-height: 1.5;
}

.credit-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-primary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.credit-link:hover {
  color: var(--color-primary-dark);
  gap: 8px;
}

.credit-link svg {
  flex-shrink: 0;
}

/* Tech Stack */
.tech-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.tech-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--color-gray-50);
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.tech-item:hover {
  background: var(--color-gray-100);
  transform: translateY(-2px);
}

.tech-icon {
  font-size: 20px;
}

.tech-name {
  font-weight: 500;
  color: var(--color-gray-700);
}

/* Footer */
.about-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid var(--color-gray-200);
  margin-top: 30px;
}

.copyright,
.built-with {
  margin: 8px 0;
  color: var(--color-gray-600);
  font-size: 13px;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9) translateY(20px);
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: all 0.3s ease;
}

/* Responsive */
@media (max-width: 640px) {
  .about-header,
  .about-body {
    padding: 30px 24px;
  }

  .tech-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .credit-card {
    flex-direction: column;
    text-align: center;
  }

  .avatar-circle {
    margin: 0 auto;
  }
}

/* Scrollbar */
.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: var(--color-gray-100);
  border-radius: 0 16px 16px 0;
}

.modal-content::-webkit-scrollbar-thumb {
  background: var(--color-gray-400);
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: var(--color-gray-500);
}
</style>
