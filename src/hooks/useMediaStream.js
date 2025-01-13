import { useState, useEffect } from 'react';

export const useMediaStream = ({ video = true, audio = true } = {}) => {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function enableStream() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video,
          audio
        });
        setStream(mediaStream);
        setError(null);
      } catch (err) {
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
  }, [video, audio]);

  return { stream, error };
};