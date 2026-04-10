import { create } from 'zustand'

export type LogLevel = 'info' | 'debug' | 'warn' | 'error'

export interface LogEntry {
  id: string
  level: LogLevel
  message: string
  data?: unknown
  timestamp: Date
}

interface LogStore {
  entries: LogEntry[]
  log: (level: LogLevel, message: string, data?: unknown) => void
  clear: () => void
}

export const useLogStore = create<LogStore>((set) => ({
  entries: [],
  log: (level, message, data) => {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      level,
      message,
      data,
      timestamp: new Date(),
    }
    // Mirror to console
    const consoleFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
    consoleFn(`[${level.toUpperCase()}] ${message}`, ...(data !== undefined ? [data] : []))

    set((state) => ({
      entries: [entry, ...state.entries].slice(0, 200), // keep last 200
    }))
  },
  clear: () => set({ entries: [] }),
}))

// Convenience helpers so callers don't need to import useLogStore directly
export const logger = {
  info:  (message: string, data?: unknown) => useLogStore.getState().log('info',  message, data),
  debug: (message: string, data?: unknown) => useLogStore.getState().log('debug', message, data),
  warn:  (message: string, data?: unknown) => useLogStore.getState().log('warn',  message, data),
  error: (message: string, data?: unknown) => useLogStore.getState().log('error', message, data),
}
