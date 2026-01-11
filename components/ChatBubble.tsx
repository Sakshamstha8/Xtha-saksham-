
import React from 'react';
import { Message, MessageType, MessageStatus } from '../types';

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isOwn }) => {
  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case MessageStatus.PENDING:
        return <i className="fa-solid fa-clock text-[9px] ml-1 opacity-50"></i>;
      case MessageStatus.SENT:
        return <i className="fa-solid fa-check text-[9px] ml-1 opacity-60"></i>;
      case MessageStatus.DELIVERED:
        return <i className="fa-solid fa-check-double text-[9px] ml-1 opacity-60"></i>;
      case MessageStatus.READ:
        return <i className="fa-solid fa-check-double text-[9px] ml-1 text-blue-400"></i>;
      default:
        return null;
    }
  };

  return (
    <div className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`max-w-[85%] rounded-xl px-2.5 py-1.5 shadow-sm relative ${
        isOwn 
          ? 'bg-emerald-100 dark:bg-emerald-800 text-gray-800 dark:text-gray-100 rounded-tr-none' 
          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none'
      }`}>
        
        {message.type === MessageType.FILE && (
          <div className="flex items-center space-x-3 p-2 mb-1 bg-black/5 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/10">
            <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded flex items-center justify-center shadow-sm">
              <i className="fa-solid fa-file-pdf text-red-500 text-xl"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{message.fileName}</p>
              <p className="text-[10px] opacity-50 uppercase">{message.fileName?.split('.').pop()}</p>
            </div>
            <i className="fa-solid fa-download opacity-40 text-sm"></i>
          </div>
        )}

        {message.content && (
          <div className="text-[14px] leading-relaxed break-words whitespace-pre-wrap">
            {message.content}
          </div>
        )}

        <div className="flex items-center justify-end space-x-1 mt-1">
          <span className="text-[9px] opacity-50 font-medium">
            {formatTime(message.timestamp)}
          </span>
          {isOwn && getStatusIcon()}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
