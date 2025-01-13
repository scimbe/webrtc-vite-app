import React from 'react';

const STATUS_STYLES = {
  connected: 'bg-green-500',
  connecting: 'bg-yellow-500 animate-pulse',
  disconnected: 'bg-red-500',
  reconnecting: 'bg-yellow-500 animate-pulse',
  failed: 'bg-red-500',
  negotiating: 'bg-blue-500 animate-pulse'
};

const STATUS_MESSAGES = {
  connected: 'Verbunden',
  connecting: 'Verbindung wird hergestellt',
  disconnected: 'Getrennt',
  reconnecting: 'Verbindung wird wiederhergestellt',
  failed: 'Verbindung fehlgeschlagen',
  negotiating: 'Verbindung wird ausgehandelt'
};

export const ConnectionStatus = ({ status, error, onRetry, canReconnect }) => {
  return (
    <div className="fixed top-4 right-4 flex items-center space-x-2 bg-gray-800 rounded-lg px-4 py-2 shadow-lg">
      <div className={`w-3 h-3 rounded-full ${STATUS_STYLES[status] || 'bg-gray-500'}`} />
      <span className="text-white text-sm">{STATUS_MESSAGES[status]}</span>
      
      {error && (
        <div className="ml-2 text-red-400 text-xs">
          {error.message}
          {canReconnect && (
            <button
              onClick={onRetry}
              className="ml-2 text-blue-400 hover:text-blue-300 underline"
            >
              Erneut versuchen
            </button>
          )}
        </div>
      )}
    </div>
  );
};