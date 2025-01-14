import { useState, useEffect, useCallback, useRef } from 'react';

export function useWebSocket(roomId) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const messageHandlersRef = useRef({});
  const reconnectAttemptRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Konfiguriere WebSocket URL basierend auf der Umgebung
  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_WS_HOST || window.location.hostname;
    const port = import.meta.env.VITE_WS_PORT || '3000';
    return `${protocol}//${host}:${port}/ws/${roomId}`;
  }, [roomId]);

  const connect = useCallback(() => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }

      console.log('Versuche WebSocket-Verbindung aufzubauen:', getWebSocketUrl());
      const websocket = new WebSocket(getWebSocketUrl());
      
      websocket.onopen = () => {
        console.log('WebSocket verbunden');
        setIsConnected(true);
        setError(null);
        reconnectAttemptRef.current = 0;
      };

      websocket.onclose = (event) => {
        console.log('WebSocket geschlossen:', event.code);
        setIsConnected(false);
        wsRef.current = null;

        if (!event.wasClean && reconnectAttemptRef.current < maxReconnectAttempts) {
          const timeout = Math.min(
            1000 * Math.pow(2, reconnectAttemptRef.current),
            30000
          );
          reconnectAttemptRef.current++;
          console.log(`Wiederverbindungsversuch ${reconnectAttemptRef.current} in ${timeout}ms`);
          setTimeout(connect, timeout);
        }
      };

      websocket.onerror = (event) => {
        console.error('WebSocket Fehler:', event);
        setError(new Error('WebSocket Verbindungsfehler'));
        setIsConnected(false);

        // Versuche alternative Verbindung über Socket.IO
        if (!import.meta.env.PROD) {
          console.log('Versuche alternative Verbindung...');
          const alternativeUrl = `${protocol}//${host}:${Number(port) + 1}/ws/${roomId}`;
          const altWebsocket = new WebSocket(alternativeUrl);
          wsRef.current = altWebsocket;
          // Setup der Event Handler für die alternative Verbindung
          setupEventHandlers(altWebsocket);
        }
      };

      websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const { type, data } = message;

          const handlers = messageHandlersRef.current[type];
          if (handlers) {
            handlers.forEach(handler => {
              try {
                handler(data);
              } catch (err) {
                console.error('Handler Fehler:', err);
              }
            });
          }
        } catch (err) {
          console.error('Nachrichtenverarbeitung fehlgeschlagen:', err);
        }
      };

      wsRef.current = websocket;

    } catch (err) {
      console.error('WebSocket Verbindungsaufbau fehlgeschlagen:', err);
      setError(err);
      setIsConnected(false);
    }
  }, [getWebSocketUrl]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, 'Cleanup');
        wsRef.current = null;
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket nicht verbunden. Nachricht nicht gesendet:', message);
      return false;
    }

    try {
      const stringifiedMessage = JSON.stringify(message);
      wsRef.current.send(stringifiedMessage);
      return true;
    } catch (err) {
      console.error('Nachricht konnte nicht gesendet werden:', err);
      return false;
    }
  }, []);

  const addMessageHandler = useCallback((type, handler) => {
    if (typeof type !== 'string' || typeof handler !== 'function') {
      console.warn('Ungültiger Message Handler:', { type, handler });
      return () => {};
    }

    if (!messageHandlersRef.current[type]) {
      messageHandlersRef.current[type] = new Set();
    }

    messageHandlersRef.current[type].add(handler);
    console.log(`Handler für '${type}' registriert`);

    return () => {
      if (messageHandlersRef.current[type]) {
        messageHandlersRef.current[type].delete(handler);
        console.log(`Handler für '${type}' entfernt`);
      }
    };
  }, []);

  return {
    isConnected: Boolean(isConnected),
    error,
    sendMessage,
    addMessageHandler
  };
}