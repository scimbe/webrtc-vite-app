import { useState, useEffect, useCallback, useRef } from 'react';

export function useWebSocket(roomId) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const messageHandlersRef = useRef({});
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const getWebSocketUrl = useCallback(() => {
    return `ws://localhost:3001/room/${roomId}`;
  }, [roomId]);

  const connect = useCallback(() => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }

      const wsUrl = getWebSocketUrl();
      console.log('Connection attempt to:', wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code);
        setIsConnected(false);

        if (!event.wasClean && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
          reconnectAttemptsRef.current++;
          console.log(`Reconnecting in ${delay}ms... Attempt ${reconnectAttemptsRef.current}`);
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

      return () => {
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
    console.log('Initiating WebSocket connection for room:', roomId);
    const cleanup = connect();
    
    return () => {
      cleanup();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, roomId]);

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