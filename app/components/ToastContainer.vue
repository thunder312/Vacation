<template>
  <Teleport to="body">
    <div :style="wrapperStyle">
      <TransitionGroup name="toast">
        <div
            v-for="toast in toasts"
            :key="toast.id"
            :style="getItemStyle(toast.type)"
            @click="remove(toast.id)"
        >
          <div :style="getIconStyle(toast.type)">
            <span v-if="toast.type === 'success'">{{ icons.toast?.success || '✓' }}</span>
            <span v-else-if="toast.type === 'error'">{{ icons.toast?.error || '✗' }}</span>
            <span v-else-if="toast.type === 'warning'">{{ icons.toast?.warning || '⚠' }}</span>
            <span v-else>{{ icons.toast?.info || 'ℹ' }}</span>
          </div>
          <div :style="messageStyle">{{ toast.message }}</div>
          <button :style="closeStyle" @click.stop="remove(toast.id)">×</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { icons } from '~/config/icons'
const { toasts, remove } = useToast()

const wrapperStyle = {
  position: 'fixed',
  top: '20px',
  right: '20px',
  bottom: 'auto',
  left: 'auto',
  zIndex: 99999,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: '10px',
  pointerEvents: 'none'
}

const baseItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  minWidth: '280px',
  maxWidth: '380px',
  padding: '12px 16px',
  background: 'white',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  pointerEvents: 'auto',
  cursor: 'pointer'
}

const typeColors: Record<string, { border: string; iconBg: string; iconColor: string }> = {
  success: { border: '#28a745', iconBg: '#d4edda', iconColor: '#155724' },
  error: { border: '#dc3545', iconBg: '#f8d7da', iconColor: '#721c24' },
  warning: { border: '#ffc107', iconBg: '#fff3cd', iconColor: '#856404' },
  info: { border: '#17a2b8', iconBg: '#d1ecf1', iconColor: '#0c5460' }
}

const getItemStyle = (type: string) => ({
  ...baseItemStyle,
  borderLeft: `4px solid ${typeColors[type]?.border || typeColors.info.border}`
})

const getIconStyle = (type: string) => ({
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  flexShrink: 0,
  fontWeight: 'bold',
  fontSize: '14px',
  background: typeColors[type]?.iconBg || typeColors.info.iconBg,
  color: typeColors[type]?.iconColor || typeColors.info.iconColor
})

const messageStyle = {
  flex: 1,
  color: '#333',
  fontSize: '14px',
  fontWeight: '500'
}

const closeStyle = {
  width: '20px',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'none',
  border: 'none',
  color: '#999',
  cursor: 'pointer',
  fontSize: '18px',
  padding: 0,
  borderRadius: '4px'
}
</script>

<style>
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
</style>