<template>
  <Teleport to="body">
    <div v-if="state.isOpen" class="modal-overlay confirm-overlay" @click.self="handleCancel">
      <div class="modal-content confirm-modal">
        <div class="modal-header">
          <h2>
            <span v-if="state.type === 'danger'">{{ icons.modal?.danger || '⚠️' }}</span>
            <span v-else-if="state.type === 'warning'">{{ icons.modal?.question || '❓' }}</span>
            <span v-else>{{ icons.modal?.info || 'ℹ️' }}</span>
            {{ state.title }}
          </h2>
          <button @click="handleCancel" class="modal-close">{{ icons.modal?.close || '✕' }}</button>
        </div>

        <div class="modal-body">
          <p class="confirm-message">{{ state.message }}</p>

          <div class="modal-actions">
            <button @click="handleCancel" class="btn-secondary">
              {{ state.cancelText }}
            </button>
            <button
              @click="handleConfirm"
              :class="state.type === 'danger' ? 'btn-danger' : 'btn-primary'"
            >
              {{ state.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { icons } from '~/config/icons'
const { state, handleConfirm, handleCancel } = useConfirm()
</script>

<style>
/* Nicht scoped, da Teleport die Elemente außerhalb der Komponente rendert */
.confirm-overlay {
  z-index: 2000 !important; /* Höher als andere Modals */
}

.confirm-modal {
  max-width: 450px;
}

.confirm-modal .confirm-message {
  font-size: 1rem;
  line-height: 1.5;
  color: var(--color-gray-700);
  margin-bottom: 24px;
}
</style>
