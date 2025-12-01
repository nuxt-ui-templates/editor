import type { EditorToolbarItem, EditorCustomHandlers } from '@nuxt/ui'
import type { Editor } from '@tiptap/vue-3'

export function useEditorToolbar<T extends EditorCustomHandlers>(_customHandlers?: T) {
  const toolbarItems: EditorToolbarItem<T>[][] = [[{
    kind: 'mention',
    icon: 'i-lucide-at-sign'
  }, {
    kind: 'emoji',
    icon: 'i-lucide-smile-plus'
  }, {
    kind: 'imageUpload',
    icon: 'i-lucide-image'
  }, {
    kind: 'horizontalRule',
    icon: 'i-lucide-separator-horizontal'
  }], [{
    kind: 'undo',
    icon: 'i-lucide-undo'
  }, {
    kind: 'redo',
    icon: 'i-lucide-redo'
  }]]

  const bubbleToolbarItems = [[{
    icon: 'i-lucide-heading',
    ui: {
      label: 'text-xs'
    },
    items: [{
      type: 'label',
      label: 'Headings'
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
    }]
  }, {
    icon: 'i-lucide-list',
    items: [{
      kind: 'bulletList',
      icon: 'i-lucide-list',
      label: 'Bullet List'
    }, {
      kind: 'orderedList',
      icon: 'i-lucide-list-ordered',
      label: 'Ordered List'
    }]
  }, {
    kind: 'blockquote',
    icon: 'i-lucide-text-quote'
  }, {
    kind: 'codeBlock',
    icon: 'i-lucide-square-code'
  }, {
    kind: 'horizontalRule',
    icon: 'i-lucide-separator-horizontal'
  }, {
    kind: 'paragraph',
    icon: 'i-lucide-type'
  }], [{
    kind: 'mark',
    mark: 'bold',
    icon: 'i-lucide-bold'
  }, {
    kind: 'mark',
    mark: 'italic',
    icon: 'i-lucide-italic'
  }, {
    kind: 'mark',
    mark: 'underline',
    icon: 'i-lucide-underline'
  }, {
    kind: 'mark',
    mark: 'strike',
    icon: 'i-lucide-strikethrough'
  }, {
    kind: 'mark',
    mark: 'code',
    icon: 'i-lucide-code'
  }], [{
    slot: 'link' as const
  }, {
    kind: 'imageUpload',
    icon: 'i-lucide-image'
  }], [{
    kind: 'textAlign',
    align: 'left',
    icon: 'i-lucide-align-left'
  }, {
    kind: 'textAlign',
    align: 'center',
    icon: 'i-lucide-align-center'
  }, {
    kind: 'textAlign',
    align: 'right',
    icon: 'i-lucide-align-right'
  }, {
    kind: 'textAlign',
    align: 'justify',
    icon: 'i-lucide-align-justify'
  }]] satisfies EditorToolbarItem<T>[][]

  const getImageToolbarItems = (editor: Editor): EditorToolbarItem<T>[][] => {
    const node = editor.state.doc.nodeAt(editor.state.selection.from)

    return [[{
      icon: 'i-lucide-download',
      to: node?.attrs?.src,
      download: true
    }, {
      icon: 'i-lucide-refresh-cw',
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
