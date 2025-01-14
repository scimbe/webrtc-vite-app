import { useState, useEffect, useCallback, useRef } from 'react';

export function useWebSocket(roomId) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const messageHandlersRef = useRef({});
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const port = '3001';
    return `${protocol}//${host}:${port}/room/${roomId}`;
  }, [roomId]);

  const connect = useCallback(() => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }

      const ws = new WebSocket(getWebSocketUrl());
      console.log('Attempting to connect to:', getWebSocketUrl());

      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code);
        setIsConnected(false);
        wsRef.current = null;

        if (!event.wasClean && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
          reconnectAttemptsRef.current++;
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