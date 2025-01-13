import { useState, useEffect, useCallback } from 'react';

export function useWebSocket(url) {
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

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

  return {
    isConnected,
    error,
    sendMessage
  };
}