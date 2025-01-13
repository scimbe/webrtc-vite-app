import React, { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';

export const RoomInvite = ({ roomId }) => {
  const [copied, setCopied] = useState(false);

  const shareRoom = async () => {
    const shareUrl = `${window.location.origin}?room=${roomId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Video Chat Einladung',
          text: 'Tritt meinem Video Chat bei!',
          url: shareUrl
        });
      } catch (err) {
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={shareRoom}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
      >
        <Share2 className="w-4 h-4" />
        <span>Einladung teilen</span>
      </button>

      {copied && (
        <span className="flex items-center text-green-500 text-sm">
          <Check className="w-4 h-4 mr-1" />
          Kopiert!
        </span>
      )}
    </div>
  );
};