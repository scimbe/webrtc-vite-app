import { useState, useEffect, useCallback } from 'react';
import { webrtcConfig } from '../config/webrtc';

export function usePeerConnection(stream, options = {}) {
  const [peerConnection, setPeerConnection] = useState(null);
  const [stats, setStats] = useState(null);

  // Statistik-Sammlung
  useEffect(() => {
    if (!peerConnection) return;

    const interval = setInterval(async () => {
      const stats = await peerConnection.getStats();
      const statsObj = {};

      stats.forEach(stat => {
        if (stat.type === 'candidate-pair' && stat.state === 'succeeded') {
          statsObj.currentRoundTripTime = stat.currentRoundTripTime;
          statsObj.availableOutgoingBitrate = stat.availableOutgoingBitrate;
        }
        if (stat.type === 'media-source') {
          statsObj.frameRate = stat.framesPerSecond;
          statsObj.resolution = `${stat.width}x${stat.height}`;
        }
      });

      setStats(statsObj);
    }, 1000);

    return () => clearInterval(interval);
  }, [peerConnection]);

  // Adaptive Bitrate basierend auf Netzwerkbedingungen
  useEffect(() => {
    if (!peerConnection || !stats) return;

    const sender = peerConnection.getSenders().find(s => s.track.kind === 'video');
    if (!sender) return;

    const parameters = sender.getParameters();
    if (!parameters.encodings) return;

    if (stats.currentRoundTripTime > 0.3) {
      // Schlechte Verbindung - niedrigere Qualität
      parameters.encodings[0].maxBitrate = 300000;
    } else if (stats.currentRoundTripTime > 0.15) {
      // Mittlere Verbindung
      parameters.encodings[0].maxBitrate = 600000;
    } else {
      // Gute Verbindung
      parameters.encodings[0].maxBitrate = 900000;
    }

    sender.setParameters(parameters).catch(console.error);
  }, [peerConnection, stats]);

  // ... Rest der Implementation

  return {
    peerConnection,
    stats,
    // ... andere returns
  };
}