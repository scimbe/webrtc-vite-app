import { useState, useEffect, useCallback, useRef } from 'react';

export function useWebSocket(roomId) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const messageHandlersRef = useRef({});
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // URL Konstruktion
  const getWebSocketUrl = useCallback(() => {
    const isSecure = window.location.protocol === 'https:';
    const protocol = isSecure ? 'wss:' : 'ws:';
    const host = 'localhost:3001';  // Für Entwicklung
    const url = `${protocol}//${host}/ws/room/${roomId}`;
    console.log('WebSocket URL:', url);
    return url;
  }, [roomId]);

  const connect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log('Maximum reconnection attempts reached');
      setError(new Error('Konnte keine Verbindung herstellen'));
      return () => {};
    }

    try {
      // Bestehende Verbindung schließen
      if (wsRef.current) {
        console.log('Closing existing connection');
        wsRef.current.close();
        wsRef.current = null;
      }

      console.log(`Connecting to WebSocket (Attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
      const ws = new WebSocket(getWebSocketUrl());
      
      // Verbindungs-Timeout
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.log('Connection timeout');
          ws.close();
        }
      }, 5000);

      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        clearTimeout(connectionTimeout);
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        clearTimeout(connectionTimeout);
        setIsConnected(false);
        wsRef.current = null;

        if (!event.wasClean && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
          reconnectAttemptsRef.current++;
          console.log(`Reconnecting in ${delay}ms... Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
          setTimeout(connect, delay);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        // Fehler nicht setzen, da onclose folgt
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Received message:', message.type);

          if (message.type === 'error') {
            console.error('Server error:', message.data);
            return;
          }

          const handlers = messageHandlersRef.current[message.type] || [];
          handlers.forEach(handler => {
            try {
              handler(message.data);
            } catch (err) {
              console.error('Handler error:', err);
            }
          });
        } catch (err) {
          console.error('Message parsing error:', err);
        }
      };

      wsRef.current = ws;

      // Ping zur Verbindungsüberprüfung
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);

      return () => {
        clearInterval(pingInterval);
        clearTimeout(connectionTimeout);
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    } catch (err) {
      console.error('Connection error:', err);
      setError(err);
      setIsConnected(false);
      return () => {};
    }
  }, [getWebSocketUrl]);

  useEffect(() => {
    console.log('Initializing WebSocket connection...');
    const cleanup = connect();
    
    return () => {
      cleanup();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, message not sent:', message);
      return false;
    }

    try {
      wsRef.current.send(JSON.stringify(message));
      return true;
    } catch (err) {
      console.error('Send error:', err);
      return false;
    }
  }, []);

  const addMessageHandler = useCallback((type, handler) => {
    if (!messageHandlersRef.current[type]) {
      messageHandlersRef.current[type] = [];
    }
    messageHandlersRef.current[type].push(handler);

    return () => {
      messageHandlersRef.current[type] = 
        messageHandlersRef.current[type].filter(h => h !== handler);
    };
  }, []);

  return {
    isConnected,
    error,
    sendMessage,
    addMessageHandler
  };
}