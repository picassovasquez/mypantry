import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Package } from 'lucide-react'
import { Dashboard } from '@/pages/Dashboard'

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
  return (
    <div className="flex min-h-screen">
      <aside className="w-52 border-r bg-sidebar flex flex-col">
        <div className="flex items-center gap-2 px-4 py-5 border-b">
          <Package className="h-5 w-5" />
          <span className="font-semibold text-sm">mypantry</span>
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
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
