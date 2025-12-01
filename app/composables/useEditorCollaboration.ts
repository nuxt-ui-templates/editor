import * as Y from 'yjs'
import Collaboration from '@tiptap/extension-collaboration'
import type { Extensions } from '@tiptap/core'

export interface CollaborationUser {
  name: string
  color: string
  avatar?: string
}

export interface CollaborationOptions {
  /**
   * The document name/room ID for collaboration
   */
  documentName: string
  /**
   * The current user information
   */
  user: CollaborationUser
  /**
   * WebRTC signaling servers (optional, uses default public servers)
   */
  signalingServers?: string[]
  /**
   * Whether collaboration is enabled (default: true)
   */
  enabled?: boolean
}

const COLORS = [
  '#f87171', // red-400
  '#fb923c', // orange-400
  '#fbbf24', // amber-400
  '#a3e635', // lime-400
  '#4ade80', // green-400
  '#2dd4bf', // teal-400
  '#22d3ee', // cyan-400
  '#60a5fa', // blue-400
  '#818cf8', // indigo-400
  '#a78bfa', // violet-400
  '#e879f9', // fuchsia-400
  '#f472b6' // pink-400
]

export function getRandomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)]!
}

export function getRandomName(): string {
  const adjectives = ['Swift', 'Clever', 'Bright', 'Quick', 'Sharp', 'Bold', 'Calm', 'Kind']
  const animals = ['Fox', 'Owl', 'Bear', 'Wolf', 'Eagle', 'Hawk', 'Lion', 'Tiger']
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${animals[Math.floor(Math.random() * animals.length)]}`
}

export function useEditorCollaboration(options: CollaborationOptions) {
  const enabled = options.enabled ?? true

  // Return empty state if disabled
  if (!enabled) {
    return {
      ydoc: null,
      fragment: null,
      isConnected: ref(false),
      isSynced: ref(false),
      connectedUsers: ref<CollaborationUser[]>([]),
      extensions: ref<Extensions>([]),
      updateUser: () => {}
    }
  }

  const ydoc = new Y.Doc()
  // Pre-initialize the prosemirror fragment to prevent "Unexpected case" errors
  const fragment = ydoc.getXmlFragment('prosemirror')

  const isConnected = ref(false)
  const isSynced = ref(false)
  const connectedUsers = ref<CollaborationUser[]>([])

  // We need to dynamically import y-webrtc on client side only
  let provider: Awaited<typeof import('y-webrtc')>['WebrtcProvider'] extends new (...args: infer A) => infer R ? R : never

  // Create collaboration extension with the Y.Doc fragment
  const collaborationExtension = Collaboration.configure({
    fragment
  })

  // Extensions array
  const extensions = ref<Extensions>([collaborationExtension])

  // Initialize provider on client side
  const initProvider = async () => {
    try {
      const { WebrtcProvider } = await import('y-webrtc')

      // Use custom signaling servers if provided, otherwise use y-webrtc defaults
      // Default servers: wss://signaling.yjs.dev, wss://y-webrtc-signaling-eu.herokuapp.com, wss://y-webrtc-signaling-us.herokuapp.com
      const providerOptions = options.signalingServers
        ? { signaling: options.signalingServers }
        : {}

      provider = new WebrtcProvider(options.documentName, ydoc, providerOptions)

      // Set the current user's awareness state
      provider.awareness.setLocalStateField('user', options.user)

      // Mark as connected once provider is ready
      // The 'synced' event only fires when there are other peers
      isConnected.value = true

      // Track sync status with other peers
      provider.on('synced', ({ synced }: { synced: boolean }) => {
        isSynced.value = synced
      })

      // Track connected users via awareness
      const updateUsers = () => {
        const states = provider?.awareness.getStates()
        if (!states) return

        const users: CollaborationUser[] = []
        states.forEach((state) => {
          if (state.user) {
            users.push(state.user as CollaborationUser)
          }
        })
        connectedUsers.value = users
      }

      provider.awareness.on('change', updateUsers)
      updateUsers()
    } catch (error) {
      console.error('Failed to initialize collaboration provider:', error)
    }
  }

  // Initialize on mount (client-side only)
  onMounted(() => {
    initProvider()
  })

  // Cleanup on unmount
  onUnmounted(() => {
    try {
      provider?.disconnect()
      provider?.destroy()
      ydoc.destroy()
    } catch {
      // Ignore cleanup errors
    }
  })

  // Update user information
  const updateUser = (user: Partial<CollaborationUser>) => {
    const currentUser = provider?.awareness.getLocalState()?.user as CollaborationUser | undefined
    if (currentUser) {
      provider?.awareness.setLocalStateField('user', {
        ...currentUser,
        ...user
      })
    }
  }

  return {
    ydoc,
    fragment,
    isConnected,
    isSynced,
    connectedUsers,
    extensions,
    updateUser
  }
}
