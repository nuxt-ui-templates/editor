<script setup lang="ts">
import type { CollaborationUser } from '~/composables/useEditorCollaboration'

defineProps<{
  users: CollaborationUser[]
}>()
</script>

<template>
  <template v-if="users.length > 0">
    <UAvatarGroup>
      <template
        v-for="user in users"
        :key="user.name"
      >
        <UTooltip :text="user.name">
          <UAvatar
            :alt="user.name"
            size="sm"
            :style="{
              color: user.color
            }"
          />
        </UTooltip>
      </template>
    </UAvatarGroup>

    <USeparator
      orientation="vertical"
      class="h-7"
    />
  </template>
</template>
