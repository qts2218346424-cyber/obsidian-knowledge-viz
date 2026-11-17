import { useEffect, useRef, useCallback, useState } from 'react'
import type { VaultEvent } from '../services/api'

type EventHandler = (event: VaultEvent) => void

export function useVaultEvents(onEvent?: EventHandler, enabled = true) {
  const [connected, setConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<VaultEvent | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const reconnectDelayRef = useRef(1000)
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = undefined
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setConnected(false)
  }, [])

  const connect = useCallback(() => {
    if (!enabled) return
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const es = new EventSource('/api/vault/events')
    eventSourceRef.current = es

    es.onopen = () => {
      setConnected(true)
      reconnectDelayRef.current = 1000 // Reset delay
    }

    es.onmessage = (event) => {
      try {
        const data: VaultEvent = JSON.parse(event.data)
        setLastEvent(data)
        onEventRef.current?.(data)
      } catch {
        // ignore parse errors (keepalive messages)
      }
    }

    es.onerror = () => {
      setConnected(false)
      es.close()
      eventSourceRef.current = null

      // Exponential backoff reconnect
      const delay = reconnectDelayRef.current
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectDelayRef.current = Math.min(delay * 2, 30000)
        connect()
      }, delay)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) {
      disconnect()
      return
    }
    connect()

    return () => {
      disconnect()
    }
  }, [enabled, connect, disconnect])

  return { connected, lastEvent }
}
