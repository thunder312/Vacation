<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast-${toast.type}`]"
          @click="remove(toast.id)"
      >
        <div class="toast-icon">
          <span v-if="toast.type === 'success'">✓</span>
          <span v-else-if="toast.type === 'error'">✗</span>
          <span v-else-if="toast.type === 'warning'">⚠</span>
          <span v-else>ℹ</span>
        </div>
        <div class="toast-message">{{ toast.message }}</div>
        <button class="toast-close" @click.stop="remove(toast.id)">×</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const { toasts, remove } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 300px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toast:hover {
  transform: translateX(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.toast-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
  font-weight: bold;
  font-size: 16px;
}

.toast-success {
  border-left: 4px solid #28a745;
}

.toast-success .toast-icon {
  background: #d4edda;
  color: #155724;
}

.toast-error {
  border-left: 4px solid #dc3545;
}

.toast-error .toast-icon {
  background: #f8d7da;
  color: #721c24;
}

.toast-warning {
  border-left: 4px solid #ffc107;
}

.toast-warning .toast-icon {
  background: #fff3cd;
  color: #856404;
}

.toast-info {
  border-left: 4px solid #17a2b8;
}

.toast-info .toast-icon {
  background: #d1ecf1;
  color: #0c5460;
}

.toast-message {
  flex: 1;
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.toast-close {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #999;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.toast-close:hover {
  color: #333;
}

/* Toast Animationen */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0.8);
}

@media (max-width: 768px) {
  .toast-container {
    left: 20px;
    right: 20px;
    top: 20px;
  }

  .toast {
    min-width: auto;
    width: 100%;
  }
}
</style>