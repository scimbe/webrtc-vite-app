import { useState, useEffect, useCallback, useRef } from 'react';

export function useWebSocket(url) {
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const messageHandlersRef = useRef({});

  const connect = useCallback(() => {
    try {
      const websocket = new WebSocket(url);
      
      websocket.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      websocket.onclose = () => {
        setIsConnected(false);
        setTimeout(connect, 3000); // Reconnect attempt
      };

      websocket.onerror = (error) => {
        setError(error);
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const handlers = messageHandlersRef.current[data.type] || [];
          handlers.forEach(handler => handler(data.data));
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      };

      setWs(websocket);
    } catch (err) {
      setError(err);
    }
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [connect, ws]);

  const sendMessage = useCallback((message) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, [ws]);

  const addMessageHandler = useCallback((type, handler) => {
    if (!messageHandlersRef.current[type]) {
      messageHandlersRef.current[type] = [];
    }
    messageHandlersRef.current[type].push(handler);

    // Return a cleanup function
    return () => {
      messageHandlersRef.current[type] = messageHandlersRef.current[type].filter(h => h !== handler);
    };
  }, []);

  return {
    isConnected,
    error,
    sendMessage,
    addMessageHandler
  };
}