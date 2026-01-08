<script setup lang="ts">
import type { EditorCustomHandlers } from '@nuxt/ui'
import type { Editor } from '@tiptap/core'
import { Emoji } from '@tiptap/extension-emoji'
import { TaskList, TaskItem } from '@tiptap/extension-list'
import { TableKit } from '@tiptap/extension-table'
import { CellSelection } from 'prosemirror-tables'
import { CodeBlockShiki } from 'tiptap-extension-code-block-shiki'
import { ImageUpload } from '~/components/editor/ImageUploadExtension'

const route = useRoute()
const runtimeConfig = useRuntimeConfig()

const room = computed(() => route.query.room as string | undefined)

const user = useState('user', () => ({
  name: getRandomName(),
  color: getRandomColor()
}))

const appConfig = useAppConfig()

const editorRef = useTemplateRef('editorRef')

const { extension: Completion, handlers: aiHandlers, isLoading: aiLoading } = useEditorCompletion(editorRef)

const {
  enabled: collaborationEnabled,
  ready: collaborationReady,
  extensions: collaborationExtensions,
  connectedUsers
} = useEditorCollaboration({
  room: room.value,
  host: runtimeConfig.public.partykitHost,
  user: {
    name: user.value.name,
    color: COLORS[user.value.color]!
  }
})

// Set primary color for the app
if (collaborationEnabled) {
  appConfig.ui.colors.primary = user.value.color
}

// Custom handlers for editor (merged with AI handlers)
const customHandlers = {
  imageUpload: {
    canExecute: (editor: Editor) => editor.can().insertContent({ type: 'imageUpload' }),
    execute: (editor: Editor) => editor.chain().focus().insertContent({ type: 'imageUpload' }),
    isActive: (editor: Editor) => editor.isActive('imageUpload'),
    isDisabled: undefined
  },
  table: {
    canExecute: (editor: Editor) => editor.can().insertTable({ rows: 3, cols: 3, withHeaderRow: true }),
    execute: (editor: Editor) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }),
    isActive: (editor: Editor) => editor.isActive('table'),
    isDisabled: undefined
  },
  ...aiHandlers
} satisfies EditorCustomHandlers

const { items: emojiItems } = useEditorEmojis()
const { items: mentionItems } = useEditorMentions(connectedUsers)
const { items: suggestionItems } = useEditorSuggestions(customHandlers)
const { getItems: getDragHandleItems, onNodeChange } = useEditorDragHandle(customHandlers)
const { toolbarItems, bubbleToolbarItems, getImageToolbarItems, getTableToolbarItems } = useEditorToolbar(customHandlers, { aiLoading })

// Default content - only used when Y.js document is empty
const content = ref(`# Nuxt UI Editor Template

A Notion-like WYSIWYG editor with AI-powered completions and real-time collaboration in [Vue](https://vuejs.org/) & [Nuxt](https://nuxt.com/).

> Add [\`?room=my-room\`](/?room=my-room) to the URL and share the link to collaborate with others.

---

## Rich Text Editing

Full formatting support with **bold**, *italic*, <u>underline</u>, ~~strikethrough~~, and \`inline code\`.

![Image Placeholder](/placeholder.jpeg)

### Code Blocks

Code blocks are supported with syntax highlighting using [Shiki](https://shiki.dev/).

\`\`\`vue
<template>
  <UEditor v-slot="{ editor }" v-model="value" content-type="markdown">
    <UEditorToolbar :editor="editor" :items="items" />
  </UEditor>
</template>
\`\`\`

### Lists

1. Numbered lists for sequential items
2. With automatic numbering

- Bullet lists work too
  - With nested items
  - At multiple levels

- [ ] Task lists for todos
- [x] Mark items as complete

### Tables

Insert and edit tables with row/column controls and cell selection.

| Feature | Description | Status |
| ------- | ----------- | ------ |
| Tables | Full table support | ✅ |
| Markdown | Content serialization | ✅ |

---

## Features

### Bubble & Fixed Toolbars

Select text to see the bubble toolbar with formatting options. The fixed toolbar at the top provides quick access to common actions.

### Drag Handle

Use the drag handle on the left side of any block to reorder, duplicate, delete, or convert between block types.

### Slash Commands

Type \`/\` anywhere to access quick insertion commands for headings, lists, code blocks, tables, images, and more.

### Image Upload

Custom image upload node powered by [\`UFileUpload\`](https://ui.nuxt.com/docs/components/file-upload) component and [NuxtHub](https://hub.nuxt.com/docs/blob) with [Vercel Blob](https://vercel.com/docs/vercel-blob) support.

<div data-type="image-upload"></div>

### Mentions & Emojis

Mention collaborators with \`@\` and add emojis with \`:\` syntax :rocket:

### AI-powered Features

Inline completions and text transformations powered by [AI SDK](https://ai-sdk.dev/).

- **Autocompletion**: Suggestions appear as you type
- **Selection actions**: Fix, extend, simplify, or translate selected text

> *Pro tip: Press \`⌘J\` to manually trigger AI completion.*

### Real-time Collaboration

Collaborative editing powered by [PartyKit](https://partykit.io/). Add \`?room=my-room\` to the URL and share the link to collaborate with others in real-time. See collaborators' cursors and selections as they type.

---

Visit the [Nuxt UI documentation](https://ui.nuxt.com/docs/components/editor) to learn more about the Editor component.
`)

// Set initial content for collaborative documents (only if empty)
function onCreate({ editor }: { editor: Editor }) {
  if (!collaborationEnabled) return

  const storageKey = `editor-initialized-${room.value}`

  // Skip if already initialized this session (handles HMR)
  if (sessionStorage.getItem(storageKey)) return

  // Wait for Y.js to sync existing content from server before checking if empty
  setTimeout(() => {
    const text = editor.state.doc.textContent.trim()
    if (!text) {
      editor.commands.setContent(content.value, { contentType: 'markdown' })
    }
    sessionStorage.setItem(storageKey, 'true')
  }, 500)
}

function onUpdate(value: string) {
  if (!collaborationEnabled) {
    content.value = value
  }
}

const extensions = computed(() => [
  CodeBlockShiki.configure({
    defaultTheme: 'material-theme',
    themes: {
      light: 'material-theme-lighter',
      dark: 'material-theme-palenight'
    }
  }),
  Completion,
  Emoji,
  ImageUpload,
  TableKit,
  TaskList,
  TaskItem,
  ...collaborationExtensions.value
])
</script>

<template>
  <UEditor
    v-if="collaborationReady"
    ref="editorRef"
    v-slot="{ editor, handlers }"
    :model-value="collaborationEnabled ? undefined : content"
    content-type="markdown"
    :extensions="extensions"
    :starter-kit="collaborationEnabled ? { undoRedo: false } : undefined"
    :handlers="customHandlers"
    autofocus
    placeholder="Write, type '/' for commands..."
    class="min-h-screen"
    :ui="{
      base: 'p-4 sm:p-14',
      content: 'max-w-4xl mx-auto'
    }"
    @update:model-value="onUpdate"
    @create="onCreate"
  >
    <AppHeader>
      <EditorCollaborationUsers :users="connectedUsers" />

      <UEditorToolbar
        :editor="editor"
        :items="toolbarItems"
      />
    </AppHeader>

    <UEditorToolbar
      :editor="editor"
      :items="bubbleToolbarItems"
      layout="bubble"
      :should-show="({ editor, view, state }: any) => {
        if (editor.isActive('imageUpload') || editor.isActive('image') || state.selection instanceof CellSelection) {
          return false
        }
        const { selection } = state
        return view.hasFocus() && !selection.empty
      }"
    >
      <template #link>
        <EditorLinkPopover :editor="editor" />
      </template>
    </UEditorToolbar>

    <UEditorToolbar
      :editor="editor"
      :items="getImageToolbarItems(editor)"
      layout="bubble"
      :should-show="({ editor, view }: any) => {
        return editor.isActive('image') && view.hasFocus()
      }"
    />

    <UEditorToolbar
      :editor="editor"
      :items="getTableToolbarItems(editor)"
      layout="bubble"
      :should-show="({ editor, view }: any) => {
        return editor.state.selection instanceof CellSelection && view.hasFocus()
      }"
    />

    <UEditorDragHandle
      v-slot="{ ui, onClick }"
      :editor="editor"
      @node-change="onNodeChange"
    >
      <UButton
        icon="i-lucide-plus"
        color="neutral"
        variant="ghost"
        size="sm"
        :class="ui.handle()"
        @click="(e: MouseEvent) => {
          e.stopPropagation()
          const node = onClick()

          handlers.suggestion?.execute(editor, { pos: node?.pos }).run()
        }"
      />

      <UDropdownMenu
        v-slot="{ open }"
        :modal="false"
        :items="getDragHandleItems(editor)"
        :content="{ side: 'left' }"
        :ui="{ content: 'w-48', label: 'text-xs' }"
        @update:open="editor.chain().setMeta('lockDragHandle', $event).run()"
      >
        <UButton
          color="neutral"
          variant="ghost"
          active-variant="soft"
          size="sm"
          icon="i-lucide-grip-vertical"
          :active="open"
          :class="ui.handle()"
        />
      </UDropdownMenu>
    </UEditorDragHandle>

    <UEditorEmojiMenu
      :editor="editor"
      :items="emojiItems"
    />
    <UEditorMentionMenu
      :editor="editor"
      :items="mentionItems"
    />
    <UEditorSuggestionMenu
      :editor="editor"
      :items="suggestionItems"
    />
  </UEditor>
</template>
