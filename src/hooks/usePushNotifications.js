import { useState, useCallback } from 'react';

export const usePushNotifications = () => {
  const [error, setError] = useState(null);

  const requestPermission = useCallback(async () => {
    try {
      if (!('Notification' in window)) {
        throw new Error('Dieser Browser unterstützt keine Push-Benachrichtigungen');
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Berechtigung für Push-Benachrichtigungen nicht erteilt');
      }
    } catch (err) {
      setError(err);
      console.error('Push-Benachrichtigungsfehler:', err);
    }
  }, []);

  const sendNotification = useCallback(async ({ title, body, icon }) => {
    try {
      if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body,
          icon
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }
    } catch (err) {
      setError(err);
      console.error('Fehler beim Senden der Benachrichtigung:', err);
    }
  }, []);

  return {
    sendNotification,
    requestPermission,
    error
  };
};
