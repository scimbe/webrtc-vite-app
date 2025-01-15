import { useState, useEffect, useCallback, useRef } from 'react';

export function useWebSocket(roomId) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const messageHandlersRef = useRef({});
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const getWebSocketUrl = useCallback(() => {
    // Nutze die Vite Proxy-Konfiguration
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/room/${roomId}`;
    console.log('WebSocket URL:', wsUrl);
    return wsUrl;
  }, [roomId]);

  const connect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return () => {};
    }

    try {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      const ws = new WebSocket(getWebSocketUrl());
      console.log('Creating new WebSocket connection...');

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
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
        setError(new Error('WebSocket connection error'));
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