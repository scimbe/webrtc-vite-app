import { useState, useCallback, useEffect } from 'react';

export function useRoom() {
  const [participants, setParticipants] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [roomStatus, setRoomStatus] = useState({
    isLocked: false,
    maxParticipants: 2,
    created: new Date().toISOString()
  });

  const lockRoom = useCallback(() => {
    setRoomStatus(prev => ({
      ...prev,
      isLocked: true
    }));
  }, []);

  const unlockRoom = useCallback(() => {
    setRoomStatus(prev => ({
      ...prev,
      isLocked: false
    }));
  }, []);

  const addParticipant = useCallback((participant) => {
    setParticipants(prev => {
      if (prev.length >= roomStatus.maxParticipants) {
        throw new Error('Room is full');
      }
      if (roomStatus.isLocked) {
        throw new Error('Room is locked');
      }
      return [...prev, participant];
    });
  }, [roomStatus.maxParticipants, roomStatus.isLocked]);

  const removeParticipant = useCallback((participantId) => {
    setParticipants(prev => 
      prev.filter(p => p.id !== participantId)
    );
  }, []);

  return {
    participants,
    isHost,
    roomStatus,
    lockRoom,
    unlockRoom,
    addParticipant,
    removeParticipant
  };
}