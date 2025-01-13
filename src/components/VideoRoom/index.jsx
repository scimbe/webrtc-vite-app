import React from 'react';

export const VideoRoom = () => {
  return (
    <div className="w-full h-full bg-gray-900 p-4">
      <video className="w-full aspect-video" autoPlay playsInline />
    </div>
  );
};
