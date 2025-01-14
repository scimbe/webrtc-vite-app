import { useState, useEffect, useCallback, useRef } from 'react';

export function useWebSocket(url) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const messageHandlersRef = useRef({});
  const reconnectAttemptRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }

      const websocket = new WebSocket(url);
      
      websocket.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttemptRef.current = 0;
        console.log('WebSocket verbunden');
      };

      websocket.onclose = (event) => {
        setIsConnected(false);
        wsRef.current = null;

        if (!event.wasClean && reconnectAttemptRef.current < maxReconnectAttempts) {
          const timeout = Math.min(
            1000 * Math.pow(2, reconnectAttemptRef.current),
            30000
          );
          reconnectAttemptRef.current++;
          setTimeout(connect, timeout);
        }
      };

      websocket.onerror = (event) => {
        setError(new Error('WebSocket Verbindungsfehler'));
        setIsConnected(false);
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
      setError(err);
      setIsConnected(false);
    }
  }, [url]);

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
      return () => {};
    }

    if (!messageHandlersRef.current[type]) {
      messageHandlersRef.current[type] = new Set();
    }

    messageHandlersRef.current[type].add(handler);

    return () => {
      if (messageHandlersRef.current[type]) {
        messageHandlersRef.current[type].delete(handler);
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