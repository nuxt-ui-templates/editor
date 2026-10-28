import { useCompletion } from '@ai-sdk/vue'
import type { MappablePosition } from '@tiptap/core'
import type { Editor } from '@tiptap/vue-3'
import { Completion } from '~/components/editor/CompletionExtension'
import type { CompletionStorage } from '~/components/editor/CompletionExtension'

type TransformMode = 'fix' | 'extend' | 'reduce' | 'simplify' | 'summarize' | 'translate'
type CompletionMode = 'continue' | TransformMode

// Only the end of the document is sent as context to continue writing
const MAX_CONTEXT_LENGTH = 2000

interface UseEditorCompletionOptions {
  api?: string
}

export function useEditorCompletion(editorRef: Ref<{ editor: Editor | undefined } | null | undefined>, options: UseEditorCompletionOptions = {}) {
  // CSRF protection
  const { csrf, headerName } = useCsrf()

  // Range toolbar actions replace with their result, kept in sync with edits made while the request runs
  let target: { from: MappablePosition, to: MappablePosition } | undefined
  const mode = ref<CompletionMode>('continue')
  const language = ref<string>()

  function getCompletionStorage() {
    const storage = editorRef.value?.editor?.storage as Record<string, CompletionStorage> | undefined
    return storage?.completion
  }

  const { completion, complete, isLoading, stop, setCompletion } = useCompletion({
    api: options.api || '/api/completion',
    streamProtocol: 'text',
    headers: { [headerName]: csrf },
    body: computed(() => ({
      mode: mode.value,
      language: language.value
    })),
    onFinish: (_prompt, completionText) => {
      const editor = editorRef.value?.editor

      // Transform modes replace the selection with the full result, parsed as markdown
      if (mode.value !== 'continue' && target && completionText && editor) {
        editor.chain()
          .focus()
          .insertContentAt({ from: target.from.position, to: target.to.position }, completionText, { contentType: 'markdown' })
          .run()
      }

      target = undefined
    },
    onError: (error) => {
      console.error('AI completion error:', error)
      target = undefined
      getCompletionStorage()?.clearSuggestion()
    }
  })

  // Stream "continue" results into the inline suggestion, or into the document for the toolbar action
  watch(completion, (newCompletion, oldCompletion) => {
    const editor = editorRef.value?.editor
    if (!editor || !newCompletion || mode.value !== 'continue') return

    const storage = getCompletionStorage()
    if (storage?.visible && storage.position !== undefined) {
      storage.setSuggestion(withLeadingSpace(editor, storage.position, newCompletion))
      editor.view.dispatch(editor.state.tr.setMeta('completionUpdate', true))
    } else if (target) {
      // The target moves past each inserted chunk
      const pos = target.to.position
      let delta = newCompletion.slice(oldCompletion?.length || 0)
      if (!oldCompletion) {
        delta = withLeadingSpace(editor, pos, delta)
      }

      editor.chain().focus().command(({ tr }) => {
        tr.insertText(delta, pos)
        return true
      }).run()
    }
  })

  // Map the target through every transaction, `editor.utils` handles collaborators' edits too.
  // Positions are recreated each time since the Yjs relative position isn't updated by local edits.
  watch(() => editorRef.value?.editor, (editor) => {
    editor?.on('transaction', ({ transaction }) => {
      if (!target) return
      setTarget(
        editor,
        editor.utils.getUpdatedPosition(target.from, transaction).position.position,
        editor.utils.getUpdatedPosition(target.to, transaction).position.position
      )
    })
  }, { immediate: true })

  function setTarget(editor: Editor, from: number, to: number) {
    target = {
      from: editor.utils.createMappablePosition(from),
      to: editor.utils.createMappablePosition(to)
    }
  }

  // Add a space before the text if it would stick to the previous word
  function withLeadingSpace(editor: Editor, pos: number, text: string) {
    const charBefore = editor.state.doc.textBetween(Math.max(0, pos - 1), pos)
    return charBefore && !/\s/.test(charBefore) && !/^\s/.test(text) ? ` ${text}` : text
  }

  function getMarkdown(editor: Editor, from: number, to: number) {
    const { doc } = editor.state
    if (editor.markdown) {
      return editor.markdown.serialize(doc.cut(from, to).toJSON())
    }
    // Fallback to plain text
    return doc.textBetween(from, to, '\n')
  }

  function completeContinue(editor: Editor, pos: number) {
    mode.value = 'continue'
    complete(getMarkdown(editor, 0, pos).slice(-MAX_CONTEXT_LENGTH))
  }

  function triggerContinue(editor: Editor) {
    if (isLoading.value) return

    getCompletionStorage()?.clearSuggestion()

    // Continue after the selection, or from the cursor
    const { to } = editor.state.selection
    setTarget(editor, to, to)
    completeContinue(editor, to)
  }

  function triggerTransform(editor: Editor, transformMode: TransformMode, lang?: string) {
    const { from, to, empty } = editor.state.selection
    if (isLoading.value || empty) return

    getCompletionStorage()?.clearSuggestion()

    mode.value = transformMode
    language.value = lang
    setTarget(editor, from, to)
    complete(getMarkdown(editor, from, to))
  }

  // Configure Completion extension
  const extension = Completion.configure({
    onTrigger: (editor) => {
      if (isLoading.value) return false
      completeContinue(editor, editor.state.selection.from)
    },
    onAccept: () => {
      setCompletion('')
    },
    onDismiss: () => {
      stop()
      setCompletion('')
    }
  })

  function createTransformHandler(transformMode: TransformMode) {
    return {
      canExecute: (editor: Editor) => !editor.state.selection.empty && !isLoading.value,
      execute: (editor: Editor, cmd?: { language?: string }) => {
        triggerTransform(editor, transformMode, cmd?.language)
        return editor.chain()
      },
      isActive: (_editor: Editor, cmd?: { language?: string }) => !!(isLoading.value && mode.value === transformMode && language.value === cmd?.language),
      isDisabled: (editor: Editor) => editor.state.selection.empty || !!isLoading.value
    }
  }

  // Create handlers for toolbar
  const handlers = {
    aiContinue: {
      canExecute: () => !isLoading.value,
      execute: (editor: Editor) => {
        triggerContinue(editor)
        return editor.chain()
      },
      isActive: () => !!(isLoading.value && mode.value === 'continue'),
      isDisabled: () => !!isLoading.value
    },
    aiFix: createTransformHandler('fix'),
    aiExtend: createTransformHandler('extend'),
    aiReduce: createTransformHandler('reduce'),
    aiSimplify: createTransformHandler('simplify'),
    aiSummarize: createTransformHandler('summarize'),
    aiTranslate: createTransformHandler('translate')
  }

  return {
    extension,
    handlers,
    isLoading,
    mode
  }
}
