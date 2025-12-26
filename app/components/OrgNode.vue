<template>
  <div class="org-node-container">
    <div class="org-node" :class="[node.role, { editable: editable }]">
      <div class="node-header">
        <div class="node-icon">
          {{ roleIcon }}
        </div>
        <div class="node-info">
          <div class="node-name">{{ node.displayName }}</div>
          <div class="node-role">{{ roleLabel }}</div>
        </div>
      </div>
      <div v-if="node.role === 'teamlead' && editable" class="node-actions">
        <small>{{ childCount }} {{ t('roles.employee') }}</small>
      </div>
    </div>

    <div v-if="node.children && node.children.length > 0" class="org-children">
      <div class="org-line"></div>
      <div class="children-container">
        <OrgNode 
          v-for="child in node.children" 
          :key="child.userId"
          :node="child"
          :editable="editable"
          @assign="$emit('assign', $event)"
          @remove="$emit('remove', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OrgNode as OrgNodeType } from '~/types/vacation'
import { icons } from '~/config/icons'

const props = defineProps<{
  node: OrgNodeType & { children?: OrgNodeType[] }
  editable?: boolean
}>()

defineEmits<{
  assign: [userId: string, teamleadId: string]
  remove: [userId: string]
}>()
const { t } = useI18n()

const roleIcon = computed(() => {
  switch (props.node.role) {
    case 'manager': return icons.roles.manager
    case 'teamlead': return icons.roles.teamlead
    case 'employee': return icons.roles.employee
    case 'office': return icons.roles.office
    case 'sysadmin': return icons.roles.sysadmin
    default: return '•'
  }
})

const roleLabel = computed(() => {
  switch (props.node.role) {
    case 'manager': return t('roles.manager')
    case 'teamlead': return t('roles.teamlead')
    case 'employee': return t('roles.employee')
    case 'office': return t('roles.office')
    default: return props.node.role
  }
})

const childCount = computed(() => {
  return props.node.children?.length || 0
})
</script>
