import { create } from 'zustand'
import type { Item } from '@/types'

// ─── Households / Members (hardcoded until Supabase auth) ───────────────────

export interface Member {
  id: string
  name: string
}

export interface Household {
  id: string
  name: string
  members: Member[]
}

export const HOUSEHOLDS: Household[] = [
  {
    id: 'h1',
    name: 'The Snug Home',
    members: [
      { id: 'm1', name: 'snuug' },
      { id: 'm2', name: 'wuug' },
    ],
  },
]

// ─── Session ─────────────────────────────────────────────────────────────────

interface Session {
  household: Household
  member: Member
}

interface SessionStore {
  session: Session | null
  signIn: (household: Household, member: Member) => void
  signOut: () => void
}

export const useSessionStore = create<SessionStore>((set) => ({
  session: null,
  signIn: (household, member) => set({ session: { household, member } }),
  signOut: () => set({ session: null }),
}))

// ─── Inventory ───────────────────────────────────────────────────────────────

interface InventoryStore {
  items: Item[]
  addItem: (item: Item) => void
}

export const useInventoryStore = create<InventoryStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
}))
