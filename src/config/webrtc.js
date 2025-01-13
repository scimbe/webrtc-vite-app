export const webrtcConfig = {
  iceServers: [
    {
      urls: [
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
      ],
    },
    {
      urls: process.env.TURN_SERVER_URL,
      username: process.env.TURN_USERNAME,
      credential: process.env.TURN_CREDENTIAL,
    },
  ],
  iceTransportPolicy: 'all',
  iceCandidatePoolSize: 10,
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
  // Optimierungen für verschiedene Netzwerkbedingungen
  sdpSemantics: 'unified-plan',
  encodings: [
    { maxBitrate: 900000, scaleResolutionDownBy: 1 },
    { maxBitrate: 600000, scaleResolutionDownBy: 2 },
    { maxBitrate: 300000, scaleResolutionDownBy: 4 }
  ]
};

export const mediaConstraints = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { max: 30 }
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
};