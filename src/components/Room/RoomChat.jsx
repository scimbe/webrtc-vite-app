import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';

export const RoomChat = ({ messages = [], onSendMessage, className = '' }) => {
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors relative"
      >
        <MessageSquare className="w-5 h-5" />
        {messages.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {messages.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 w-80 bg-slate-800 rounded-lg shadow-xl">
          <div className="flex flex-col h-96">
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-2 ${msg.isSelf ? 'text-right' : ''}`}
                >
                  <div
                    className={`inline-block px-3 py-2 rounded-lg ${
                      msg.isSelf ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {!msg.isSelf && (
                      <span className="text-xs text-slate-400 block mb-1">
                        {msg.sender}
                      </span>
                    )}
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2"
                  placeholder="Nachricht schreiben..."
                />
                <button
                  type="submit"
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};