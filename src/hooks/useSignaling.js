import { useEffect, useCallback, useRef } from 'react';

const WEBSOCKET_URL = 'ws://localhost:3001';

export function useSignaling() {
  const wsRef = useRef(null);
  const handlersRef = useRef(new Map());

  const connect = useCallback((roomId, userId) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const ws = new WebSocket(WEBSOCKET_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'join',
        roomId,
        userId
      }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const handler = handlersRef.current.get(message.type);
      if (handler) {
        handler(message);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const sendSignal = useCallback((type, data, target) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, data, target }));
    }
  }, []);

  const on = useCallback((type, handler) => {
    handlersRef.current.set(type, handler);
    return () => handlersRef.current.delete(type);
  }, []);

  useEffect(() => {
    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, []);

  return { connect, sendSignal, on };
}