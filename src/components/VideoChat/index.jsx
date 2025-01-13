import React, { useState, useCallback, useEffect } from 'react';
import { VideoStream } from './VideoStream';
import { Controls } from './Controls';
import { useMediaStream } from '../../hooks/useMediaStream';
import { usePeerConnection } from '../../hooks/usePeerConnection';
import { useSignaling } from '../../hooks/useSignaling';

export const VideoChat = () => {
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [roomId, setRoomId] = useState(null);
  const [userId] = useState(`user-${Math.random().toString(36).slice(2)}`);

  const { stream, error: mediaError } = useMediaStream({ video: videoEnabled, audio: audioEnabled });
  const {
    remoteStream,
    connectionState,
    createOffer,
    handleAnswer,
    handleOffer,
    addIceCandidate
  } = usePeerConnection(stream);

  const { connect, sendSignal, on } = useSignaling();

  useEffect(() => {
    const roomIdFromUrl = new URLSearchParams(window.location.search).get('room');
    if (roomIdFromUrl) {
      setRoomId(roomIdFromUrl);
      connect(roomIdFromUrl, userId);
    }
  }, [connect, userId]);

  useEffect(() => {
    const cleanup = [];

    cleanup.push(on('joined', async ({ participants }) => {
      if (participants.length > 1) {
        const offer = await createOffer();
        sendSignal('offer', offer, participants[0]);
      }
    }));

    cleanup.push(on('offer', async ({ data, sender }) => {
      const answer = await handleOffer(data);
      if (answer) {
        sendSignal('answer', answer, sender);
      }
    }));

    cleanup.push(on('answer', async ({ data }) => {
      await handleAnswer(data);
    }));

    cleanup.push(on('ice-candidate', async ({ data }) => {
      await addIceCandidate(data);
    }));

    return () => cleanup.forEach(fn => fn());
  }, [on, createOffer, handleOffer, handleAnswer, addIceCandidate, sendSignal]);

  // ... Rest des Komponenten-Codes bleibt gleich
};