import { useEffect, useRef, useCallback, useState } from 'react';
import { WebSocketService } from '../services/WebSocketService';

export function useWebSocket(url, options = {}) {
  const [status, setStatus] = useState({
    isConnected: false,
    error: null,
    reconnectAttempt: 0
  });
  const [lastMessage, setLastMessage] = useState(null);
  const wsRef = useRef(null);
  const messageHandlers = useRef(new Map());

  const handleError = useCallback((error) => {
    setStatus(prev => ({
      ...prev,
      error: error.message || 'WebSocket connection failed'
    }));
  }, []);

  const handleReconnect = useCallback((attempt) => {
    setStatus(prev => ({
      ...prev,
      reconnectAttempt: attempt
    }));
  }, []);

  useEffect(() => {
    wsRef.current = new WebSocketService(url, {
      ...options,
      onError: handleError,
      onReconnect: handleReconnect
    });
    
    wsRef.current.onOpen(() => {
      setStatus(prev => ({
        ...prev,
        isConnected: true,
        error: null,
        reconnectAttempt: 0
      }));
    });

    wsRef.current.onClose(() => {
      setStatus(prev => ({
        ...prev,
        isConnected: false
      }));
    });

    wsRef.current.onMessage((message) => {
      setLastMessage(message);
      const handler = messageHandlers.current.get(message.type);
      if (handler) handler(message);
    });

    return () => wsRef.current.disconnect();
  }, [url, options, handleError, handleReconnect]);

  const sendMessage = useCallback((type, payload, priority = false) => {
    if (!wsRef.current) return false;
    
    return wsRef.current.send({ type, payload }, priority);
  }, []);

  const addMessageHandler = useCallback((type, handler) => {
    messageHandlers.current.set(type, handler);
    return () => messageHandlers.current.delete(type);
  }, []);

  return {
    status,
    lastMessage,
    sendMessage,
    addMessageHandler
  };
}