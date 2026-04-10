import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Package, LogOut } from 'lucide-react'
import { Dashboard } from '@/pages/Dashboard'
import { EntryPage } from '@/pages/EntryPage'
import { LogPanel } from '@/components/dev/LogPanel'
import { useSessionStore } from '@/lib/store'

const queryClient = new QueryClient()

const navItems = [
  { to: '/',         label: 'Dashboard' },
  { to: '/fridge',   label: 'Fridge' },
  { to: '/pantry',   label: 'Pantry' },
  { to: '/freezer',  label: 'Freezer' },
  { to: '/shopping', label: 'Shopping' },
  { to: '/settings', label: 'Settings' },
]

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      {title} — coming soon
    </div>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  const { session, signOut } = useSessionStore()

  return (
    <div className="flex min-h-screen">
      <aside className="w-52 border-r bg-sidebar flex flex-col">
        <div className="flex items-center gap-2 px-4 py-5 border-b">
          <Package className="h-5 w-5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">mypantry</p>
            {session && (
              <p className="text-xs text-sidebar-foreground/60 truncate">{session.household.name}</p>
            )}
          </div>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        {session && (
          <div className="px-3 py-4 border-t flex items-center justify-between">
            <span className="text-sm font-medium text-sidebar-foreground">{session.member.name}</span>
            <button
              onClick={signOut}
              className="p-1.5 rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
              title="Switch user"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}

function AppRoutes() {
  const session = useSessionStore((s) => s.session)

  if (!session) return <EntryPage />

  return (
    <Layout>
      <Routes>
        <Route path="/"         element={<Dashboard />} />
        <Route path="/fridge"   element={<Placeholder title="Fridge" />} />
        <Route path="/pantry"   element={<Placeholder title="Pantry" />} />
        <Route path="/freezer"  element={<Placeholder title="Freezer" />} />
        <Route path="/shopping" element={<Placeholder title="Shopping list" />} />
        <Route path="/settings" element={<Placeholder title="Settings" />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster />
        <LogPanel />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
