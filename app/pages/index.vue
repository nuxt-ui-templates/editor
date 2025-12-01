<script setup lang="ts">
import type { EditorCustomHandlers } from '@nuxt/ui'
import type { Editor } from '@tiptap/core'
import { Emoji } from '@tiptap/extension-emoji'
import TextAlign from '@tiptap/extension-text-align'
import ImageUpload from '../components/editor/ImageUpload'

// Collaboration is only enabled when a room is specified via ?room=xxx
const route = useRoute()
const roomId = computed(() => route.query.room as string | undefined)
const collaborationEnabled = computed(() => !!roomId.value)

const { extensions: collaborationExtensions, connectedUsers, fragment } = useEditorCollaboration({
  documentName: roomId.value || '',
  enabled: collaborationEnabled.value,
  user: {
    name: getRandomName(),
    color: getRandomColor()
  }
})

// Custom handlers for editor
const customHandlers = {
  imageUpload: {
    canExecute: (editor: Editor) => editor.can().insertContent({ type: 'imageUpload' }),
    execute: (editor: Editor) => editor.chain().focus().insertContent({ type: 'imageUpload' }),
    isActive: (editor: Editor) => editor.isActive('imageUpload'),
    isDisabled: undefined
  }
} satisfies EditorCustomHandlers

// Editor composables
const { items: suggestionItems } = useEditorSuggestions(customHandlers)
const { items: emojiItems } = useEditorEmojis()
const { items: mentionItems } = useEditorMentions(connectedUsers)
const { getItems: getDragHandleItems, onNodeChange } = useEditorDragHandle(customHandlers)
const { toolbarItems, bubbleToolbarItems, getImageToolbarItems } = useEditorToolbar(customHandlers)

// Default content - only used when Y.js document is empty
const content = ref(`# Nuxt UI: A Modern UI Library

Welcome to **Nuxt UI**, a comprehensive UI library for *Nuxt 3* applications.
Built with [Tailwind CSS](https://tailwindcss.com) and [Reka UI](https://reka-ui.com), it provides a complete set of components for building beautiful interfaces.

![Image Placeholder](/placeholder.jpeg)

## Key Features

Nuxt UI combines the best of modern web development

- **Fully typed** with TypeScript support
- *Customizable* theme system with semantic colors
- <u>Accessible</u> components following ARIA guidelines
- Built on top of \`Reka UI\` primitives
- Support for ~~legacy browsers~~ modern standards

### Getting Started

Install Nuxt UI in your project with the following command:

\`\`\`
npx nuxi@latest module add ui
\`\`\`

> *Nuxt UI is designed to be intuitive and easy to use, whether you're building a simple landing page or a complex application.*

### Component Categories

1. Layout components (Container, Card, Accordion)
2. Form components (Input, Select, Checkbox)
3. Navigation (Navbar, Sidebar, Breadcrumb)
4. Feedback (Alert, Toast, Modal)

#### Code Example

Here's a simple example using the \`Button\` component:

\`\`\`
<template>
  <UButton color="primary">
    Click me
  </UButton>
</template>
\`\`\`

---

## Advanced Features

Powerful capabilities for modern applications

- Dark mode support out of the box
- Keyboard shortcuts for improved accessibility
- Nested lists support:
  - With multiple levels
  - And proper spacing

Whether you're working on a personal project or building an enterprise application, Nuxt UI provides all the tools you need to create stunning user interfaces quickly and efficiently. The library is constantly evolving with new components and improvements based on community feedback.

Visit our [documentation](https://ui.nuxt.com) to learn more and explore all available components.
`)

// Set initial content for collaborative documents (only if empty)
const onEditorCreate = ({ editor }: { editor: Editor }) => {
  console.log('onEditorCreate', fragment)
  // Only set content if collaboration is enabled and Y.js fragment is empty
  if (collaborationEnabled.value && fragment) {
    // Wait a tick for Y.js to initialize, then check if empty
    setTimeout(() => {
      // Check if Y.js fragment has no content
      console.log('setting content')
      editor.commands.setContent(content.value, {
        contentType: 'markdown'
      })
    }, 100)
  }
}

const extensions = computed(() => [
  Emoji,
  ImageUpload,
  TextAlign.configure({
    types: ['heading', 'paragraph']
  }),
  ...collaborationExtensions.value
])
</script>

<template>
  <UEditor
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
    @update:model-value="!collaborationEnabled && (content = $event)"
    @create="onEditorCreate"
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
        if (editor.isActive('imageUpload') || editor.isActive('image')) {
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
          const node = onClick(e)

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

    <UEditorSuggestionMenu
      :editor="editor"
      :items="suggestionItems"
    />
    <UEditorMentionMenu
      :editor="editor"
      :items="mentionItems"
    />
    <UEditorEmojiMenu
      :editor="editor"
      :items="emojiItems"
    />
  </UEditor>
</template>
