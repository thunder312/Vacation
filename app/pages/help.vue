<template>
  <div class="help-container">
    <div class="help-header">
      <button @click="goBack" class="back-button">
        {{ icons.common?.arrowLeft || '←' }} {{ t('common.back') }}
      </button>
      <h1>{{ t('about.help') }}</h1>
    </div>

    <div v-if="loading" class="loading">
      {{ t('common.loading') }}
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else class="help-content markdown-body" v-html="renderedContent"></div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import { icons } from '~/config/icons'

const { t } = useI18n()
const { currentUser, isAuthenticated, initAuth } = useAuth()

const loading = ref(true)
const error = ref('')
const renderedContent = ref('')

// Mapping von Rolle zu User Guide Datei
const roleToGuide: Record<string, string> = {
  'employee': 'USER_GUIDE_EMPLOYEE.md',
  'teamlead': 'USER_GUIDE_TEAMLEAD.md',
  'manager': 'USER_GUIDE_MANAGER.md',
  'office': 'USER_GUIDE_OFFICE.md',
  'sysadmin': 'USER_GUIDE_SYSADMIN.md'
}

const goBack = () => {
  window.close()
  // Falls window.close() nicht funktioniert (z.B. wenn nicht per window.open geöffnet)
  navigateTo('/vacation')
}

onMounted(async () => {
  initAuth()

  // Redirect wenn nicht eingeloggt
  if (!isAuthenticated.value) {
    navigateTo('/login')
    return
  }

  // Bestimme die richtige Guide-Datei basierend auf der Rolle
  // Administrator bekommt den SysAdmin Guide
  const role = currentUser.value?.role === 'administrator'
    ? 'sysadmin'
    : (currentUser.value?.role || 'employee')

  const guideFile = roleToGuide[role] || 'USER_GUIDE_EMPLOYEE.md'

  try {
    // Lade die Markdown-Datei
    const response = await fetch(`/docs/${guideFile}`)

    if (!response.ok) {
      throw new Error(`Hilfe-Dokument nicht gefunden: ${guideFile}`)
    }

    const markdown = await response.text()

    // Konfiguriere marked für bessere Darstellung
    marked.setOptions({
      breaks: true,
      gfm: true
    })

    // Rendere Markdown zu HTML
    renderedContent.value = await marked(markdown)
  } catch (e: any) {
    error.value = e.message || 'Fehler beim Laden der Hilfe'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.help-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  background: var(--bg-primary, #ffffff);
}

.help-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color, #e0e0e0);
}

.help-header h1 {
  margin: 0;
  font-size: 1.75rem;
  color: var(--text-primary, #333);
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--bg-secondary, #f5f5f5);
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-primary, #333);
  transition: all 0.2s;
}

.back-button:hover {
  background: var(--bg-hover, #e8e8e8);
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
}

.error {
  color: var(--color-error, #dc3545);
}

/* Markdown Styling */
.help-content {
  line-height: 1.7;
  color: var(--text-primary, #333);
}

.help-content :deep(h1) {
  font-size: 2rem;
  margin: 2rem 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-primary, #007bff);
  color: var(--text-primary, #333);
}

.help-content :deep(h2) {
  font-size: 1.5rem;
  margin: 1.5rem 0 1rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid var(--border-color, #e0e0e0);
  color: var(--text-primary, #333);
}

.help-content :deep(h3) {
  font-size: 1.25rem;
  margin: 1.25rem 0 0.75rem;
  color: var(--text-primary, #333);
}

.help-content :deep(h4) {
  font-size: 1.1rem;
  margin: 1rem 0 0.5rem;
  color: var(--text-secondary, #666);
}

.help-content :deep(p) {
  margin: 0.75rem 0;
}

.help-content :deep(ul),
.help-content :deep(ol) {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
}

.help-content :deep(li) {
  margin: 0.4rem 0;
}

.help-content :deep(code) {
  background: var(--bg-secondary, #f5f5f5);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9em;
}

.help-content :deep(pre) {
  background: var(--bg-secondary, #f5f5f5);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1rem 0;
}

.help-content :deep(pre code) {
  background: none;
  padding: 0;
}

.help-content :deep(blockquote) {
  border-left: 4px solid var(--color-primary, #007bff);
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  background: var(--bg-secondary, #f5f5f5);
  border-radius: 0 8px 8px 0;
}

.help-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.help-content :deep(th),
.help-content :deep(td) {
  border: 1px solid var(--border-color, #e0e0e0);
  padding: 0.75rem;
  text-align: left;
}

.help-content :deep(th) {
  background: var(--bg-secondary, #f5f5f5);
  font-weight: 600;
}

.help-content :deep(tr:nth-child(even)) {
  background: var(--bg-secondary, #f9f9f9);
}

.help-content :deep(a) {
  color: var(--color-primary, #007bff);
  text-decoration: none;
}

.help-content :deep(a:hover) {
  text-decoration: underline;
}

.help-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--border-color, #e0e0e0);
  margin: 2rem 0;
}

.help-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1rem 0;
}

/* Dark mode support */
:root.dark .help-container {
  background: var(--bg-primary, #1a1a1a);
}

:root.dark .help-content :deep(code),
:root.dark .help-content :deep(pre),
:root.dark .help-content :deep(blockquote) {
  background: var(--bg-secondary, #2d2d2d);
}
</style>
