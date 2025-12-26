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
          <span v-if="toast.type === 'success'">{{icons.actions.approve}}</span>
          <span v-else-if="toast.type === 'error'">{{icons.actions.reject}}</span>
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
import { icons } from '~/config/icons'
const { toasts, remove } = useToast()
</script>