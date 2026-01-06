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
      icon: 'i-lucide-spell-check',
      label: 'Fix spelling & grammar'
    }, {
      kind: 'aiExtend',
      icon: 'i-lucide-unfold-vertical',
      label: 'Extend text'
    }, {
      kind: 'aiReduce',
      icon: 'i-lucide-fold-vertical',
      label: 'Reduce text'
    }, {
      kind: 'aiSimplify',
      icon: 'i-lucide-lightbulb',
      label: 'Simplify text'
    }, {
      kind: 'aiContinue',
      icon: 'i-lucide-text',
      label: 'Continue sentence'
    }, {
      kind: 'aiSummarize',
      icon: 'i-lucide-list',
      label: 'Summarize'
    }, {
      icon: 'i-lucide-languages',
      label: 'Translate',
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
      icon: 'i-lucide-heading-1',
      label: 'Heading 1'
    }, {
      kind: 'heading',
      level: 2,
      icon: 'i-lucide-heading-2',
      label: 'Heading 2'
    }, {
      kind: 'heading',
      level: 3,
      icon: 'i-lucide-heading-3',
      label: 'Heading 3'
    }, {
      kind: 'heading',
      level: 4,
      icon: 'i-lucide-heading-4',
      label: 'Heading 4'
    }, {
      kind: 'bulletList',
      icon: 'i-lucide-list',
      label: 'Bullet List'
    }, {
      kind: 'orderedList',
      icon: 'i-lucide-list-ordered',
      label: 'Ordered List'
    }, {
      kind: 'blockquote',
      icon: 'i-lucide-text-quote',
      label: 'Blockquote'
    }, {
      kind: 'codeBlock',
      icon: 'i-lucide-square-code',
      label: 'Code Block'
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
  }], [{
    icon: 'i-lucide-align-justify',
    tooltip: { text: 'Text Align' },
    content: {
      align: 'end'
    },
    items: [{
      kind: 'textAlign',
      align: 'left',
      icon: 'i-lucide-align-left',
      label: 'Align Left'
    }, {
      kind: 'textAlign',
      align: 'center',
      icon: 'i-lucide-align-center',
      label: 'Align Center'
    }, {
      kind: 'textAlign',
      align: 'right',
      icon: 'i-lucide-align-right',
      label: 'Align Right'
    }, {
      kind: 'textAlign',
      align: 'justify',
      icon: 'i-lucide-align-justify',
      label: 'Align Justify'
    }]
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

  return {
    toolbarItems,
    bubbleToolbarItems,
    getImageToolbarItems
  }
}
