import React from 'react';
import { Clock } from 'lucide-react';

export const WaitingRoom = ({ userName, onReady }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg p-8 shadow-xl max-w-md w-full text-center">
        <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">
          Willkommen, {userName}!
        </h1>
        <p className="text-slate-300 mb-6">
          Bevor Sie beitreten, testen Sie bitte Ihre Audio- und Videoeinstellungen.
        </p>

        <div className="space-y-6">
          <div className="bg-slate-700 rounded-lg p-4">
            {/* Hier könnte ein Video-Preview kommen */}
            <div className="aspect-video bg-slate-900 rounded-lg mb-4"></div>
            
            <div className="flex justify-center space-x-4">
              <button className="p-2 rounded-full bg-slate-600 hover:bg-slate-500 text-white">
                {/* Mic Icon */}
              </button>
              <button className="p-2 rounded-full bg-slate-600 hover:bg-slate-500 text-white">
                {/* Camera Icon */}
              </button>
            </div>
          </div>

          <button
            onClick={onReady}
            className="w-full bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition-colors"
          >
            Dem Raum beitreten
          </button>
        </div>
      </div>
    </div>
  );
};