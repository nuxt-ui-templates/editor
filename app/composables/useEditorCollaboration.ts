import * as Y from 'yjs'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCaret from '@tiptap/extension-collaboration-caret'
import type { Extensions } from '@tiptap/core'
import type YPartyKitProvider from 'y-partykit/provider'

export interface CollaborationUser {
  name: string
  color: string
  avatar?: string
}

export interface CollaborationOptions {
  roomId?: string
  user: CollaborationUser
  host?: string
}

const COLORS = [
  '#f87171', '#fb923c', '#fbbf24', '#a3e635',
  '#4ade80', '#2dd4bf', '#22d3ee', '#60a5fa',
  '#818cf8', '#a78bfa', '#e879f9', '#f472b6'
]

const ADJECTIVES = ['Swift', 'Clever', 'Bright', 'Quick', 'Sharp', 'Bold', 'Calm', 'Kind']
const ANIMALS = ['Fox', 'Owl', 'Bear', 'Wolf', 'Eagle', 'Hawk', 'Lion', 'Tiger']

export const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)]!
export const getRandomName = () => `${ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]} ${ANIMALS[Math.floor(Math.random() * ANIMALS.length)]}`

export function useEditorCollaboration(options: CollaborationOptions) {
  const { roomId, user, host } = options

  // Collaboration is only active if both roomId AND host are provided
  const isEnabled = !!roomId && !!host

  const isConnected = ref(false)
  const connectedUsers = ref<CollaborationUser[]>([])
  const extensions = shallowRef<Extensions>([])
  const ready = ref(false)

  // Return early if disabled or no host provided
  if (!isEnabled) {
    return {
      enabled: false as const,
      ready: ref(true), // Always ready when disabled
      isConnected,
      connectedUsers,
      extensions,
      updateUser: (_user: Partial<CollaborationUser>) => {}
    }
  }

  // Y.js document
  const ydoc = new Y.Doc()

  // Provider instance
  let provider: YPartyKitProvider | null = null

  const updateUsers = () => {
    const states = provider?.awareness?.getStates()
    if (!states) return

    connectedUsers.value = Array.from(states.values())
      .filter((state): state is { user: CollaborationUser } => !!state.user)
      .map(state => state.user)
  }

  const updateUser = (newUser: Partial<CollaborationUser>) => {
    const current = provider?.awareness?.getLocalState()?.user as CollaborationUser | undefined
    if (current) {
      provider?.awareness?.setLocalStateField('user', { ...current, ...newUser })
    }
  }

  // Initialize on client
  onMounted(async () => {
    const { default: Provider } = await import('y-partykit/provider')

    provider = new Provider(host!, roomId!, ydoc)
    provider.awareness.setLocalStateField('user', user)

    // Now add caret extension with provider
    extensions.value = [
      Collaboration.configure({ document: ydoc }),
      CollaborationCaret.configure({
        provider,
        user
      })
    ]

    // Mark as ready so editor can render
    ready.value = true

    provider.on('status', ({ status }: { status: string }) => {
      isConnected.value = status === 'connected'
      if (status === 'connected') {
        updateUsers()
      }
    })

    provider.awareness.on('change', updateUsers)
    provider.awareness.on('update', updateUsers)
    updateUsers()

    isConnected.value = provider.wsconnected
  })

  // Cleanup
  onUnmounted(() => {
    provider?.destroy()
    ydoc.destroy()
  })

  return {
    enabled: true as const,
    ready,
    isConnected,
    connectedUsers,
    extensions,
    updateUser
  }
}
