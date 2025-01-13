import { useState, useEffect, useCallback, useRef } from 'react';

export function useWebSocket(url) {
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const messageHandlersRef = useRef({});
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    // Clear any existing timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    try {
      const websocket = new WebSocket(url);
      
      websocket.onopen = () => {
        setIsConnected(true);
        setError(null);
        console.log('WebSocket connection established');
      };

      websocket.onclose = (event) => {
        setIsConnected(false);
        console.warn('WebSocket connection closed:', event);
        
        // Exponential backoff for reconnection
        const timeout = reconnectTimeoutRef.current ? 
          Math.min(reconnectTimeoutRef.current * 2, 30000) : 1000;
        
        reconnectTimeoutRef.current = setTimeout(connect, timeout);
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError(error);
        websocket.close();
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
      console.error('WebSocket connection error:', err);
      setError(err);
      
      // Retry connection
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    }
  }, [url]);

  useEffect(() => {
    connect();

    return () => {
      // Clear reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // Close WebSocket
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
    console.warn('Cannot send message: WebSocket not open');
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
    addMessageHandler,
    ws
  };
}