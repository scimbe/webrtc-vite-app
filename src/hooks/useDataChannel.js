import { useState, useEffect, useCallback, useRef } from 'react';

export function useDataChannel(peerConnection) {
  const [messages, setMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const channelRef = useRef(null);

  const setupChannel = useCallback((channel) => {
    channel.onopen = () => setIsOpen(true);
    channel.onclose = () => setIsOpen(false);
    
    channel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setMessages(prev => [...prev, message]);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    channelRef.current = channel;
  }, []);

  useEffect(() => {
    if (!peerConnection) return;

    // Sender erstellt den Channel
    const channel = peerConnection.createDataChannel('chat', {
      ordered: true,
      maxRetransmits: 3
    });
    setupChannel(channel);

    // Empfänger wartet auf den Channel
    peerConnection.ondatachannel = (event) => {
      setupChannel(event.channel);
    };

    return () => {
      if (channelRef.current) {
        channelRef.current.close();
      }
    };
  }, [peerConnection, setupChannel]);

  const sendMessage = useCallback((content, type = 'text') => {
    if (!channelRef.current || channelRef.current.readyState !== 'open') {
      return false;
    }

    try {
      const message = {
        id: Date.now(),
        type,
        content,
        timestamp: new Date().toISOString(),
        sender: 'local'
      };

      channelRef.current.send(JSON.stringify(message));
      setMessages(prev => [...prev, message]);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }, []);

  return {
    messages,
    isOpen,
    sendMessage
  };
}