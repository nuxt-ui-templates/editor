import type { EditorToolbarItem, EditorCustomHandlers } from '@nuxt/ui'
import type { Editor } from '@tiptap/vue-3'

interface UseEditorToolbarOptions {
  aiLoading?: Ref<boolean | undefined>
}

export function useEditorToolbar<T extends EditorCustomHandlers>(_customHandlers?: T, options: UseEditorToolbarOptions = {}) {
  const { aiLoading } = options

  const toolbarItems: EditorToolbarItem<T>[][] = [[{
    kind: 'undo',
    icon: 'i-lucide-undo',
    tooltip: { text: 'Undo' }
  }, {
    kind: 'redo',
    icon: 'i-lucide-redo',
    tooltip: { text: 'Redo' }
  }], [{
    kind: 'imageUpload',
    label: 'Add',
    icon: 'i-lucide-image',
    tooltip: { text: 'Add image' }
  }]]

  const bubbleToolbarItems = computed(() => [[{
    icon: 'i-lucide-sparkles',
    label: 'Improve',
    activeColor: 'neutral',
    activeVariant: 'ghost',
    loading: aiLoading?.value,
    content: {
      align: 'start'
    },
    items: [{
      kind: 'aiFix',
      label: 'Fix spelling & grammar',
      icon: 'i-lucide-spell-check'
    }, {
      kind: 'aiExtend',
      label: 'Extend text',
      icon: 'i-lucide-unfold-vertical'
    }, {
      kind: 'aiReduce',
      label: 'Reduce text',
      icon: 'i-lucide-fold-vertical'
    }, {
      kind: 'aiSimplify',
      label: 'Simplify text',
      icon: 'i-lucide-lightbulb'
    }, {
      kind: 'aiContinue',
      label: 'Continue sentence',
      icon: 'i-lucide-text'
    }, {
      kind: 'aiSummarize',
      label: 'Summarize',
      icon: 'i-lucide-list'
    }, {
      label: 'Translate',
      icon: 'i-lucide-languages',
      children: [{
        kind: 'aiTranslate',
        language: 'English',
        label: 'English'
      }, {
        kind: 'aiTranslate',
        language: 'French',
        label: 'French'
      }, {
        kind: 'aiTranslate',
        language: 'Spanish',
        label: 'Spanish'
      }, {
        kind: 'aiTranslate',
        language: 'German',
        label: 'German'
      }]
    }]
  }], [{
    label: 'Turn into',
    trailingIcon: 'i-lucide-chevron-down',
    activeColor: 'neutral',
    activeVariant: 'ghost',
    tooltip: { text: 'Turn into' },
    content: {
      align: 'start'
    },
    ui: {
      label: 'text-xs'
    },
    items: [{
      type: 'label',
      label: 'Turn into'
    }, {
      kind: 'paragraph',
      label: 'Paragraph',
      icon: 'i-lucide-type'
    }, {
      kind: 'heading',
      level: 1,
      label: 'Heading 1',
      icon: 'i-lucide-heading-1'
    }, {
      kind: 'heading',
      level: 2,
      label: 'Heading 2',
      icon: 'i-lucide-heading-2'
    }, {
      kind: 'heading',
      level: 3,
      label: 'Heading 3',
      icon: 'i-lucide-heading-3'
    }, {
      kind: 'heading',
      level: 4,
      label: 'Heading 4',
      icon: 'i-lucide-heading-4'
    }, {
      kind: 'bulletList',
      label: 'Bullet List',
      icon: 'i-lucide-list'
    }, {
      kind: 'orderedList',
      label: 'Ordered List',
      icon: 'i-lucide-list-ordered'
    }, {
      kind: 'taskList',
      label: 'Task List',
      icon: 'i-lucide-list-check'
    }, {
      kind: 'blockquote',
      label: 'Blockquote',
      icon: 'i-lucide-text-quote'
    }, {
      kind: 'codeBlock',
      label: 'Code Block',
      icon: 'i-lucide-square-code'
    }]
  }], [{
    kind: 'mark',
    mark: 'bold',
    icon: 'i-lucide-bold',
    tooltip: { text: 'Bold' }
  }, {
    kind: 'mark',
    mark: 'italic',
    icon: 'i-lucide-italic',
    tooltip: { text: 'Italic' }
  }, {
    kind: 'mark',
    mark: 'underline',
    icon: 'i-lucide-underline',
    tooltip: { text: 'Underline' }
  }, {
    kind: 'mark',
    mark: 'strike',
    icon: 'i-lucide-strikethrough',
    tooltip: { text: 'Strikethrough' }
  }, {
    kind: 'mark',
    mark: 'code',
    icon: 'i-lucide-code',
    tooltip: { text: 'Code' }
  }], [{
    slot: 'link' as const,
    icon: 'i-lucide-link'
  }, {
    kind: 'imageUpload',
    icon: 'i-lucide-image',
    tooltip: { text: 'Image' }
  }]] satisfies EditorToolbarItem<T>[][])

  const getImageToolbarItems = (editor: Editor): EditorToolbarItem<T>[][] => {
    const node = editor.state.doc.nodeAt(editor.state.selection.from)

    return [[{
      icon: 'i-lucide-download',
      to: node?.attrs?.src,
      download: true,
      tooltip: { text: 'Download' }
    }, {
      icon: 'i-lucide-refresh-cw',
      tooltip: { text: 'Replace' },
      onClick: () => {
        const { state } = editor
        const { selection } = state

        const pos = selection.from
        const node = state.doc.nodeAt(pos)

        if (node && node.type.name === 'image') {
          editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).insertContentAt(pos, { type: 'imageUpload' }).run()
        }
      }
    }], [{
      icon: 'i-lucide-trash',
      tooltip: { text: 'Delete' },
      onClick: () => {
        const { state } = editor
        const { selection } = state

        const pos = selection.from
        const node = state.doc.nodeAt(pos)

        if (node && node.type.name === 'image') {
          editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run()
        }
      }
    }]]
  }

  const getTableToolbarItems = (editor: Editor): EditorToolbarItem<T>[][] => {
    return [[{
      icon: 'i-lucide-between-vertical-start',
      tooltip: { text: 'Add row above' },
      onClick: () => {
        editor.chain().focus().addRowBefore().run()
      }
    }, {
      icon: 'i-lucide-between-vertical-end',
      tooltip: { text: 'Add row below' },
      onClick: () => {
        editor.chain().focus().addRowAfter().run()
      }
    }, {
      icon: 'i-lucide-between-horizontal-start',
      tooltip: { text: 'Add column before' },
      onClick: () => {
        editor.chain().focus().addColumnBefore().run()
      }
    }, {
      icon: 'i-lucide-between-horizontal-end',
      tooltip: { text: 'Add column after' },
      onClick: () => {
        editor.chain().focus().addColumnAfter().run()
      }
    }], [{
      icon: 'i-lucide-rows-3',
      tooltip: { text: 'Delete row' },
      onClick: () => {
        editor.chain().focus().deleteRow().run()
      }
    }, {
      icon: 'i-lucide-columns-3',
      tooltip: { text: 'Delete column' },
      onClick: () => {
        editor.chain().focus().deleteColumn().run()
      }
    }], [{
      icon: 'i-lucide-trash',
      tooltip: { text: 'Delete table' },
      onClick: () => {
        editor.chain().focus().deleteTable().run()
      }
    }]]
  }

  return {
    toolbarItems,
    bubbleToolbarItems,
    getImageToolbarItems,
    getTableToolbarItems
  }
}
