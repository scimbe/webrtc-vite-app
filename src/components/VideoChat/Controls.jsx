import React from 'react';
import { Camera, CameraOff, Mic, MicOff } from 'lucide-react';

export const Controls = ({ videoEnabled, audioEnabled, onToggleVideo, onToggleAudio }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900 to-transparent">
      <div className="flex justify-center space-x-4">
        <button
          onClick={onToggleVideo}
          className={`p-4 rounded-full ${videoEnabled ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'} transition-colors`}
          aria-label={videoEnabled ? 'Disable video' : 'Enable video'}
        >
          {videoEnabled ? <Camera className="w-6 h-6 text-white" /> : <CameraOff className="w-6 h-6 text-white" />}
        </button>
        <button
          onClick={onToggleAudio}
          className={`p-4 rounded-full ${audioEnabled ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'} transition-colors`}
          aria-label={audioEnabled ? 'Disable audio' : 'Enable audio'}
        >
          {audioEnabled ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-white" />}
        </button>
      </div>
    </div>
  );
};