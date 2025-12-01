import type { EditorEmojiMenuItem } from '@nuxt/ui'
import { gitHubEmojis } from '@tiptap/extension-emoji'

export function useEditorEmojis() {
  const items: EditorEmojiMenuItem[] = gitHubEmojis.filter(
    emoji => !emoji.name.startsWith('regional_indicator_')
  )

  return {
    items
  }
}
