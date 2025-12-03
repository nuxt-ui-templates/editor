import * as Y from 'yjs'
import YPartyKitProvider from 'y-partykit/provider'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCaret from '@tiptap/extension-collaboration-caret'
import type { Extensions } from '@tiptap/core'
import { useThrottleFn } from '@vueuse/core'

export interface CollaborationUser {
  name: string
  color: string
  avatar?: string
}

export interface CollaborationOptions {
  room?: string
  user: CollaborationUser
  host?: string
}

export const COLORS: Record<string, string> = {
  red: '#f87171',
  orange: '#fb923c',
  amber: '#fbbf24',
  yellow: '#facc15',
  lime: '#a3e635',
  green: '#4ade80',
  emerald: '#34d399',
  teal: '#2dd4bf',
  cyan: '#22d3ee',
  sky: '#38bdf8',
  blue: '#60a5fa',
  indigo: '#818cf8',
  violet: '#a78bfa',
  purple: '#c084fc',
  fuchsia: '#e879f9',
  pink: '#f472b6',
  rose: '#fb7185'
}

const ADJECTIVES = [
  'Swift', 'Clever', 'Bright', 'Quick', 'Sharp', 'Bold', 'Calm', 'Kind',
  'Brave', 'Wise', 'Noble', 'Mighty', 'Gentle', 'Fierce', 'Silent', 'Wild',
  'Golden', 'Silver', 'Cosmic', 'Lucky', 'Mystic', 'Stellar', 'Radiant', 'Daring'
]
const ANIMALS = [
  'Fox', 'Owl', 'Bear', 'Wolf', 'Eagle', 'Hawk', 'Lion', 'Tiger',
  'Falcon', 'Panther', 'Dolphin', 'Phoenix', 'Dragon', 'Raven', 'Lynx', 'Otter',
  'Stag', 'Cobra', 'Jaguar', 'Crane', 'Badger', 'Viper', 'Condor', 'Gazelle'
]

export const getRandomColor = () => {
  const keys = Object.keys(COLORS)

  return keys[Math.floor(Math.random() * keys.length)]!
}
export const getRandomName = () => `${ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]} ${ANIMALS[Math.floor(Math.random() * ANIMALS.length)]}`

export function useEditorCollaboration(options: CollaborationOptions) {
  const { room, user, host } = options

  // Collaboration is only active if both room AND host are provided
  const isEnabled = !!room && !!host

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

  const updateUsers = useThrottleFn(() => {
    const states = provider?.awareness?.getStates()
    if (!states) return

    const users = Array.from(states.entries())
      .filter((entry): entry is [number, { user: CollaborationUser }] => !!entry[1].user)
      .map(([id, state]) => ({ ...state.user, id }))

    if (JSON.stringify(users) !== JSON.stringify(connectedUsers.value)) {
      connectedUsers.value = users
    }
  }, 100, true)

  const updateUser = (newUser: Partial<CollaborationUser>) => {
    const current = provider?.awareness?.getLocalState()?.user as CollaborationUser | undefined
    if (current) {
      provider?.awareness?.setLocalStateField('user', { ...current, ...newUser })
    }
  }

  // Initialize on client
  onMounted(async () => {
    provider = new YPartyKitProvider(host, room, ydoc)
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
