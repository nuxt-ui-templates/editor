import type { EditorMentionMenuItem } from '@nuxt/ui'
import type { CollaborationUser } from './useEditorCollaboration'

export function useEditorMentions(collaborationUsers?: Ref<CollaborationUser[]>) {
  const items = computed<EditorMentionMenuItem[]>(() => {
    if (!collaborationUsers?.value?.length) {
      return [{
        label: 'benjamincanac',
        avatar: { src: 'https://github.com/benjamincanac.png' },
        color: '#000000'
      }]
    }

    return collaborationUsers.value.map(user => ({
      label: user.name,
      avatar: user.avatar ? { src: user.avatar } : undefined,
      color: user.color
    }))
  })

  return {
    items
  }
}
