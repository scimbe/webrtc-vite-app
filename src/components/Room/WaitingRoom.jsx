import React from 'react';
import { Clock } from 'lucide-react';

export const WaitingRoom = ({ userName, onReady }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg p-8 shadow-xl max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <Clock className="w-16 h-16 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Willkommen, {userName}!
        </h2>
        <p className="text-slate-300 mb-8">
          Bitte überprüfe deine Kamera und Mikrofoneinstellungen.
        </p>
        <button
          onClick={onReady}
          className="w-full bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
        >
          Bereit zum Beitreten
        </button>
      </div>
    </div>
  );
};