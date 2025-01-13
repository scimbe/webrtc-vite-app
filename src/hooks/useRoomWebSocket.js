import { useState, useCallback, useEffect, useRef } from 'react';

export function useRoomWebSocket(roomId, userId, options = {}) {
  const [status, setStatus] = useState('connecting');
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const messageHandlers = useRef(new Map());

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(`ws://localhost:3001/room/${roomId}`);
      
      ws.onopen = () => {
        setStatus('connected');
        setError(null);
        // Initial join message
        if (options.joinMessage) {
          ws.send(JSON.stringify(options.joinMessage));
        }
      };

      ws.onclose = () => {
        setStatus('disconnected');
        // Reconnect logic
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            connect();
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        setError(error);
        setStatus('error');
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const handler = messageHandlers.current.get(message.type);
          if (handler) {
            handler(message.data);
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      setError(error);
      setStatus('error');
    }
  }, [roomId, options.joinMessage]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  const sendMessage = useCallback((type, data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, data }));
      return true;
    }
    return false;
  }, []);

  const addMessageHandler = useCallback((type, handler) => {
    messageHandlers.current.set(type, handler);
    return () => messageHandlers.current.delete(type);
  }, []);

  return {
    status,
    error,
    sendMessage,
    addMessageHandler
  };
}