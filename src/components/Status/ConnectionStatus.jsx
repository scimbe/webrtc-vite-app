import React from 'react';

export const ConnectionStatus = ({ connected }) => {
  return (
    <div className="flex items-center space-x-2">
      <div
        className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}
      />
      <span className="text-white text-sm">
        {connected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
};