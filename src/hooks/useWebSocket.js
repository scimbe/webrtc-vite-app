import { useEffect, useRef, useCallback, useState } from 'react';
import { WebSocketService } from '../services/WebSocketService';

export function useWebSocket(url) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const wsRef = useRef(null);
  const messageHandlers = useRef(new Map());

  useEffect(() => {
    wsRef.current = new WebSocketService(url);
    
    wsRef.current.onOpen(() => setIsConnected(true));
    wsRef.current.onClose(() => setIsConnected(false));
    wsRef.current.onMessage((message) => {
      setLastMessage(message);
      const handler = messageHandlers.current.get(message.type);
      if (handler) handler(message);
    });

    return () => wsRef.current.disconnect();
  }, [url]);

  const sendMessage = useCallback((type, payload) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send({ type, payload });
    }
  }, [isConnected]);

  const addMessageHandler = useCallback((type, handler) => {
    messageHandlers.current.set(type, handler);
    return () => messageHandlers.current.delete(type);
  }, []);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    addMessageHandler
  };
}