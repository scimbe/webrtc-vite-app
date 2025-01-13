import React from 'react';
import { formatRelative } from 'date-fns';

export const Message = ({ message, isLocal }) => {
  const alignmentClass = isLocal ? 'ml-auto' : 'mr-auto';
  const bgClass = isLocal ? 'bg-blue-500' : 'bg-gray-700';

  return (
    <div className={`max-w-[75%] ${alignmentClass} mb-4`}>
      <div className={`rounded-lg p-3 ${bgClass} text-white`}>
        <p className="text-sm">{message.content}</p>
        <span className="text-xs opacity-75 block mt-1">
          {formatRelative(new Date(message.timestamp), new Date())}
        </span>
      </div>
    </div>
  );
};