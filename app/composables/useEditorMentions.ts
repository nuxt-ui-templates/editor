import type { EditorMentionMenuItem } from '@nuxt/ui'
import type { CollaborationUser } from './useEditorCollaboration'

const FALLBACK_USERS = [{
  label: 'benjamincanac',
  avatar: { src: 'https://avatars.githubusercontent.com/u/739984?v=4' }
}, {
  label: 'atinux',
  avatar: { src: 'https://avatars.githubusercontent.com/u/904724?v=4' }
}, {
  label: 'HugoRCD',
  avatar: { src: 'https://avatars.githubusercontent.com/u/71938701?v=4' }
}]

export function useEditorMentions(collaborationUsers?: Ref<CollaborationUser[]>) {
  const items = computed<EditorMentionMenuItem[]>(() => {
    if (!collaborationUsers?.value?.length) {
      return FALLBACK_USERS
    }

    return collaborationUsers.value.map(user => ({
      label: user.name,
      avatar: {
        alt: user.name,
        style: { color: user.color }
      }
    }))
  })

  return {
    items
  }
}
