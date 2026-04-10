import { useState, useRef, useCallback } from 'react'
import { Mic, MicOff, Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import Anthropic from '@anthropic-ai/sdk'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Item, ItemLocation } from '@/types'
import { useInventoryStore } from '@/lib/store'
import { logger } from '@/lib/logger'

interface ParsedItem {
  name: string
  quantity: number
  unit: string
  location: ItemLocation
}

type State = 'idle' | 'listening' | 'processing' | 'review'

const VALID_UNITS = ['g', 'kg', 'ml', 'L', 'oz', 'lbs', 'count', 'cups', 'tbsp', 'tsp']

// SpeechRecognition browser types
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

export function VoiceAddDialog() {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<State>('idle')
  const [transcript, setTranscript] = useState('')
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([])
  const recognitionRef = useRef<any>(null)
  const addItem = useInventoryStore((s) => s.addItem)

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined

  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      logger.error('SpeechRecognition API not available in this browser')
      toast.error('Voice input is not supported in this browser.')
      return
    }
    logger.info('Voice recognition started')
    setTranscript('')
    setParsedItems([])
    setState('listening')

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognitionRef.current = recognition

    recognition.onresult = (event: any) => {
      let full = ''
      for (let i = 0; i < event.results.length; i++) {
        full += event.results[i][0].transcript
      }
      logger.debug('Speech transcript updated', { transcript: full })
      setTranscript(full)
    }

    recognition.onerror = (event: any) => {
      logger.error('Speech recognition error', { error: event.error, message: event.message })
    }

    recognition.onend = () => {
      logger.info('Voice recognition ended')
      setState((s) => (s === 'listening' ? 'processing' : s))
    }

    recognition.start()
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setState('processing')
  }, [])

  // Parse transcript with Claude once state becomes 'processing'
  const parseTranscript = useCallback(async (text: string) => {
    if (!text.trim()) {
      setState('idle')
      return
    }

    if (!apiKey) {
      logger.error('VITE_ANTHROPIC_API_KEY is not set in .env.local')
      toast.error('Add VITE_ANTHROPIC_API_KEY to your .env.local to use voice input.')
      setState('idle')
      return
    }

    logger.info('Sending transcript to Claude for parsing', { transcript: text })

    try {
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [
          {
            role: 'user',
            content: `Extract pantry items from this voice transcript. Return ONLY a JSON array, no other text.

Each object must have:
- "name": string (item name)
- "quantity": number
- "unit": one of exactly: ${VALID_UNITS.join(', ')}
- "location": one of exactly: "fridge", "pantry", "freezer" (infer from item type — dairy/meat/produce → fridge, dry goods → pantry, frozen → freezer)

If quantity is unclear, use 1. If unit is unclear, use "count".

Transcript: "${text}"`,
          },
        ],
      })

      const content = response.content[0]
      if (content.type !== 'text') throw new Error('Unexpected response')

      const json = content.text.match(/\[[\s\S]*\]/)
      if (!json) throw new Error('No JSON array found')

      const items: ParsedItem[] = JSON.parse(json[0])
      logger.info('Claude parsed items successfully', { items })
      setParsedItems(items)
      setState('review')
    } catch (err) {
      logger.error('Failed to parse Claude response', { err, rawResponse: (err as any)?.message })
      toast.error('Could not parse items. Try again.')
      setState('idle')
    }
  }, [apiKey])

  // Trigger parse when state changes to processing
  const handleStateChange = useCallback((newState: State, text: string) => {
    setState(newState)
    if (newState === 'processing') {
      parseTranscript(text)
    }
  }, [parseTranscript])

  const confirmItems = () => {
    logger.info(`Adding ${parsedItems.length} item(s) from voice input`)
    const now = new Date().toISOString()
    parsedItems.forEach((parsed) => {
      addItem({
        id: crypto.randomUUID(),
        household_id: 'h1',
        name: parsed.name,
        quantity: parsed.quantity,
        unit: parsed.unit,
        location: parsed.location,
        category: '',
        min_quantity: 0,
        expiry_date: null,
        created_at: now,
        updated_at: now,
      })
    })
    toast.success(`Added ${parsedItems.length} item${parsedItems.length > 1 ? 's' : ''} to inventory`)
    handleClose()
  }

  const handleClose = () => {
    recognitionRef.current?.stop()
    setState('idle')
    setTranscript('')
    setParsedItems([])
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); else setOpen(true) }}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Mic className="h-4 w-4" />
        Voice
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add by voice</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Idle / Listening */}
          {(state === 'idle' || state === 'listening') && (
            <div className="flex flex-col items-center gap-4 py-4">
              <button
                onClick={state === 'idle' ? startListening : stopListening}
                className={`rounded-full p-6 transition-colors ${
                  state === 'listening'
                    ? 'bg-red-100 text-red-600 animate-pulse'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {state === 'listening' ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
              </button>
              <p className="text-sm text-muted-foreground text-center">
                {state === 'idle'
                  ? 'Tap the mic and say what you\'re adding — e.g. "2 liters of milk and 500 grams of chicken"'
                  : 'Listening… tap to stop'}
              </p>
              {transcript && (
                <p className="text-sm bg-muted rounded-md px-3 py-2 w-full italic">"{transcript}"</p>
              )}
              {state === 'listening' && (
                <Button onClick={stopListening} size="sm">Done talking</Button>
              )}
            </div>
          )}

          {/* Processing */}
          {state === 'processing' && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Parsing your items…</p>
              {transcript && (
                <p className="text-sm bg-muted rounded-md px-3 py-2 w-full italic">"{transcript}"</p>
              )}
            </div>
          )}

          {/* Review */}
          {state === 'review' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Review items to add:</p>
              <ul className="space-y-2">
                {parsedItems.map((item, i) => (
                  <li key={i} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground">
                      {item.quantity} {item.unit} · <span className="capitalize">{item.location}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setState('idle')}
              >
                Try again
              </Button>
            </div>
          )}
        </div>

        {state === 'review' && (
          <DialogFooter showCloseButton>
            <Button onClick={confirmItems}>
              <Plus className="h-4 w-4" />
              Add {parsedItems.length} item{parsedItems.length > 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
