'use client';

import { TypingIndicator as TypingIndicatorType } from '@/types';

interface TypingIndicatorProps {
  typingUsers: TypingIndicatorType[];
  currentUserId: string;
}

export default function TypingIndicator({ typingUsers, currentUserId }: TypingIndicatorProps) {
  const otherTypingUsers = typingUsers.filter(user => user.userId !== currentUserId);

  if (otherTypingUsers.length === 0) {
    return null;
  }

  const getTypingMessage = () => {
    if (otherTypingUsers.length === 1) {
      return `${otherTypingUsers[0].username} is typing...`;
    } else if (otherTypingUsers.length === 2) {
      return `${otherTypingUsers[0].username} and ${otherTypingUsers[1].username} are typing...`;
    } else {
      return `${otherTypingUsers[0].username} and ${otherTypingUsers.length - 1} others are typing...`;
    }
  };

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500 italic bg-gray-50 rounded-lg p-3">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span>{getTypingMessage()}</span>
    </div>
  );
} 