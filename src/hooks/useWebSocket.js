import { useState, useEffect, useCallback, useRef } from 'react';

export function useWebSocket(url) {
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const messageHandlersRef = useRef({});
  const reconnectAttemptRef = useRef(0);

  const connect = useCallback(() => {
    // Exponential Backoff mit zufälliger Variation
    const baseTimeout = 1000;
    const timeout = Math.min(
      baseTimeout * Math.pow(2, reconnectAttemptRef.current) + 
      Math.random() * 500, 
      30000
    );
    reconnectAttemptRef.current++;

    try {
      const websocket = new WebSocket(url);
      
      websocket.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttemptRef.current = 0;
        console.log('WebSocket verbunden:', {
          url,
          timestamp: new Date().toISOString()
        });
      };

      websocket.onclose = (event) => {
        setIsConnected(false);
        console.warn('WebSocket geschlossen:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          url,
          reconnectAttempt: reconnectAttemptRef.current,
          timestamp: new Date().toISOString()
        });

        // Automatische Wiederverbindung
        setTimeout(connect, timeout);
      };

      websocket.onerror = (error) => {
        console.error('WebSocket Fehler:', {
          url,
          error: {
            type: error.type,
            target: error.target.toString(),
            eventPhase: error.eventPhase
          },
          reconnectAttempt: reconnectAttemptRef.current,
          timestamp: new Date().toISOString()
        });
        setError(error);
        websocket.close();
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const handlers = messageHandlersRef.current[data.type] || [];
          handlers.forEach(handler => handler(data.data));
        } catch (err) {
          console.error('Nachrichtenverarbeitung fehlgeschlagen:', {
            error: err,
            rawData: event.data
          });
        }
      };

      setWs(websocket);
    } catch (err) {
      console.error('WebSocket Verbindungsaufbau fehlgeschlagen:', {
        url,
        error: err,
        reconnectAttempt: reconnectAttemptRef.current,
        timestamp: new Date().toISOString()
      });
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
  }, [connect]);

  const sendMessage = useCallback((message) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      return true;
    }
    console.warn('Nachricht konnte nicht gesendet werden: WebSocket nicht offen', {
      readyState: ws?.readyState,
      message
    });
    return false;
  }, [ws]);

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
    addMessageHandler,
    ws
  };
}