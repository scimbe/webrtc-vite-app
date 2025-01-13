import { useCallback, useEffect, useRef } from 'react';

export function useReconnection({
  isConnected,
  reconnectAttempts,
  maxAttempts = 5,
  onReconnect
}) {
  const timeoutRef = useRef(null);
  const attemptsRef = useRef(reconnectAttempts);

  const clearReconnectionTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const attemptReconnection = useCallback(() => {
    if (attemptsRef.current >= maxAttempts) {
      return false;
    }

    clearReconnectionTimeout();
    
    const backoffTime = Math.min(1000 * Math.pow(2, attemptsRef.current), 10000);
    timeoutRef.current = setTimeout(() => {
      onReconnect();
      attemptsRef.current += 1;
    }, backoffTime);

    return true;
  }, [maxAttempts, onReconnect, clearReconnectionTimeout]);

  useEffect(() => {
    attemptsRef.current = reconnectAttempts;

    if (!isConnected && reconnectAttempts < maxAttempts) {
      attemptReconnection();
    }

    return clearReconnectionTimeout;
  }, [isConnected, reconnectAttempts, maxAttempts, attemptReconnection, clearReconnectionTimeout]);

  return {
    canReconnect: reconnectAttempts < maxAttempts,
    reconnect: attemptReconnection,
    cancelReconnection: clearReconnectionTimeout
  };
}