import { useState } from 'react'
import { Package, Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSessionStore, HOUSEHOLDS, type Household, type Member } from '@/lib/store'

function initials(name: string) {
  return name.slice(0, 1).toUpperCase()
}

const AVATAR_COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
]

function avatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length]
}

export function EntryPage() {
  const signIn = useSessionStore((s) => s.signIn)
  const [selectedHousehold, setSelectedHousehold] = useState<Household>(HOUSEHOLDS[0])
  const [households, setHouseholds] = useState<Household[]>(HOUSEHOLDS)
  const [addingHousehold, setAddingHousehold] = useState(false)
  const [newHouseholdName, setNewHouseholdName] = useState('')

  const handleAddHousehold = () => {
    const name = newHouseholdName.trim()
    if (!name) return
    const newHousehold: Household = {
      id: `h${Date.now()}`,
      name,
      members: [],
    }
    setHouseholds((prev) => [...prev, newHousehold])
    setSelectedHousehold(newHousehold)
    setNewHouseholdName('')
    setAddingHousehold(false)
  }

  const handleSelectMember = (member: Member) => {
    signIn(selectedHousehold, member)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Branding */}
      <div className="flex items-center gap-2 mb-10">
        <Package className="h-6 w-6" />
        <span className="text-xl font-semibold">mypantry</span>
      </div>

      <div className="w-full max-w-sm space-y-8">
        {/* Household selection */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Household</h2>
          <div className="space-y-2">
            {households.map((h) => (
              <button
                key={h.id}
                onClick={() => setSelectedHousehold(h)}
                className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                  selectedHousehold.id === h.id
                    ? 'border-foreground bg-foreground/5'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <span className="font-medium text-sm">{h.name}</span>
                {selectedHousehold.id === h.id && (
                  <Check className="h-4 w-4 text-foreground" />
                )}
              </button>
            ))}

            {/* Add household */}
            {addingHousehold ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={newHouseholdName}
                  onChange={(e) => setNewHouseholdName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddHousehold(); if (e.key === 'Escape') setAddingHousehold(false) }}
                  placeholder="Household name"
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <Button size="sm" onClick={handleAddHousehold}>Add</Button>
                <Button size="sm" variant="ghost" onClick={() => setAddingHousehold(false)}>Cancel</Button>
              </div>
            ) : (
              <button
                onClick={() => setAddingHousehold(true)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-1"
              >
                <Plus className="h-4 w-4" />
                Add household
              </button>
            )}
          </div>
        </div>

        {/* Member selection */}
        {selectedHousehold.members.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Who are you?</h2>
            <div className="grid grid-cols-2 gap-3">
              {selectedHousehold.members.map((member, i) => (
                <button
                  key={member.id}
                  onClick={() => handleSelectMember(member)}
                  className="flex flex-col items-center gap-3 rounded-xl border border-border px-4 py-6 hover:border-foreground hover:bg-foreground/5 transition-colors"
                >
                  <div className={`h-14 w-14 rounded-full flex items-center justify-center text-2xl font-semibold ${avatarColor(i)}`}>
                    {initials(member.name)}
                  </div>
                  <span className="text-sm font-medium">{member.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            No members in this household yet.
          </p>
        )}
      </div>
    </div>
  )
}
