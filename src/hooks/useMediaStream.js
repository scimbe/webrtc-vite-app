import { useState, useEffect } from 'react';
import { mediaConstraints } from '../config/webrtc';

export function useMediaStream() {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function enableStream() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
        setStream(mediaStream);
        setError(null);
      } catch (err) {
        console.error('Media stream error:', err);
        setError(err);
        setStream(null);
      }
    }

    enableStream();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return { stream, error };
}