import { useState } from 'react'
import { Terminal, X, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useLogStore, type LogLevel } from '@/lib/logger'

const levelStyles: Record<LogLevel, string> = {
  info:  'text-blue-600  dark:text-blue-400',
  debug: 'text-gray-500  dark:text-gray-400',
  warn:  'text-yellow-600 dark:text-yellow-400',
  error: 'text-red-600   dark:text-red-400',
}

const levelBadge: Record<LogLevel, string> = {
  info:  'bg-blue-100  text-blue-700',
  debug: 'bg-gray-100  text-gray-600',
  warn:  'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100   text-red-700',
}

export function LogPanel() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const { entries, clear } = useLogStore()

  const errorCount = entries.filter((e) => e.level === 'error').length

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Log panel */}
      {open && (
        <div className="w-[min(480px,calc(100vw-2rem))] rounded-xl border bg-background shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Terminal className="h-4 w-4" />
              App Logs
              {entries.length > 0 && (
                <span className="text-xs text-muted-foreground">({entries.length})</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clear}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Clear logs"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Entries */}
          <div className="overflow-y-auto max-h-80 text-xs font-mono divide-y">
            {entries.length === 0 ? (
              <p className="text-center text-muted-foreground py-6 text-xs">No logs yet.</p>
            ) : (
              entries.map((entry) => (
                <div key={entry.id} className="px-3 py-1.5 hover:bg-muted/30">
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground shrink-0 mt-0.5">
                      {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className={`shrink-0 px-1 rounded text-[10px] font-semibold uppercase mt-0.5 ${levelBadge[entry.level]}`}>
                      {entry.level}
                    </span>
                    <span className={`flex-1 break-all ${levelStyles[entry.level]}`}>{entry.message}</span>
                    {entry.data !== undefined && (
                      <button
                        onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                      >
                        {expanded === entry.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    )}
                  </div>
                  {expanded === entry.id && entry.data !== undefined && (
                    <pre className="mt-1 ml-[4.5rem] text-[10px] bg-muted rounded p-2 overflow-x-auto text-muted-foreground whitespace-pre-wrap">
                      {JSON.stringify(entry.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full bg-foreground text-background px-3 py-2 text-xs font-medium shadow-lg hover:opacity-90 transition-opacity"
      >
        <Terminal className="h-3.5 w-3.5" />
        Logs
        {errorCount > 0 && (
          <span className="bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold">
            {errorCount}
          </span>
        )}
      </button>
    </div>
  )
}
