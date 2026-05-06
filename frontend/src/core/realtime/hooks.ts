/**
 * React Query hooks for real-time dashboard data.
 */

import { useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getRealtimeMetrics, getRealtimeEvents } from "./api";
import type { RealtimeMetrics, RealtimeEvent, WsRealtimeMessage } from "./types";

const METRICS_KEY = ["realtime", "metrics"] as const;
const EVENTS_KEY = ["realtime", "events"] as const;

/**
 * Fetch current real-time metrics with a 5 s stale time.
 * Falls back to ``null`` when backend is unreachable.
 */
export function useRealtimeMetrics() {
  return useQuery<RealtimeMetrics | null>({
    queryKey: METRICS_KEY,
    queryFn: getRealtimeMetrics,
    staleTime: 5000,
    retry: 1,
  });
}

/**
 * Fetch recent real-time events from the ring buffer.
 */
export function useRealtimeEvents(limit = 50) {
  return useQuery<RealtimeEvent[] | null>({
    queryKey: [...EVENTS_KEY, limit],
    queryFn: () => getRealtimeEvents(limit),
    staleTime: 5000,
    retry: 1,
  });
}

/**
 * Hook that connects to the ``/ws/realtime`` WebSocket and merges live
 * metrics + events into React Query caches so the dashboard stays live
 * without polling.
 *
 * Returns a ``connectionState``: ``"connecting" | "open" | "closed"``.
 */
export function useRealtimeWebSocket() {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectionStateRef = useRef<"connecting" | "open" | "closed">("closed");

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const url = `${protocol}//${host}/ws/realtime`;

    connectionStateRef.current = "connecting";
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      connectionStateRef.current = "open";
      // Invalidate metrics + events to trigger a REST fetch
      queryClient.invalidateQueries({ queryKey: METRICS_KEY });
      queryClient.invalidateQueries({ queryKey: EVENTS_KEY });
    };

    ws.onmessage = (event) => {
      try {
        const msg: WsRealtimeMessage = JSON.parse(event.data);

        if (msg.type === "metrics") {
          queryClient.setQueryData(METRICS_KEY, msg.data);
        } else if (msg.type === "event") {
          // Prepend event to existing cache
          queryClient.setQueryData<RealtimeEvent[]>(
            EVENTS_KEY,
            (prev) => {
              const list = prev ?? [];
              return [msg.data, ...list].slice(0, 100);
            }
          );
        }
        // pong messages are handled separately by RTT hooks
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      connectionStateRef.current = "closed";
      wsRef.current = null;
      // Auto-reconnect after 3 s
      reconnectTimerRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [queryClient]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { connect };
}
