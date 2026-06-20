import { useEffect, useRef, useCallback, useState } from 'react'
import type { VaultEvent } from '../services/api'

type EventHandler = (event: VaultEvent) => void

export function useVaultEvents(onEvent?: EventHandler) {
  const [connected, setConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<VaultEvent | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const reconnectDelayRef = useRef(1000)

  const connect = useCallback(() => {
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
        onEvent?.(data)
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
  }, [onEvent])

  useEffect(() => {
    connect()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [connect])

  return { connected, lastEvent }
}
