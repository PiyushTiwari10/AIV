'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { websocketClient } from '@/lib/websocket';

interface CommentFormProps {
  onSubmit: (content: string) => void;
  isLoading?: boolean;
}

interface FormData {
  content: string;
}

export default function CommentForm({ onSubmit, isLoading = false }: CommentFormProps) {
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<FormData>();

  const content = watch('content');

  // Handle typing indicators
  useEffect(() => {
    if (content && content.trim().length > 0) {
      if (!isTyping) {
        setIsTyping(true);
        websocketClient.startTyping();
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        websocketClient.stopTyping();
      }, 2000);
    } else {
      if (isTyping) {
        setIsTyping(false);
        websocketClient.stopTyping();
      }
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [content, isTyping]);

  // Cleanup typing indicator when component unmounts
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        websocketClient.stopTyping();
      }
    };
  }, [isTyping]);

  const handleFormSubmit = (data: FormData) => {
    if (data.content.trim()) {
      onSubmit(data.content.trim());
      reset();
      setIsTyping(false);
      websocketClient.stopTyping();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
        <div>
          <textarea
            {...register('content', {
              required: 'Comment content is required',
              minLength: {
                value: 1,
                message: 'Comment cannot be empty',
              },
              maxLength: {
                value: 1000,
                message: 'Comment cannot exceed 1000 characters',
              },
            })}
            placeholder="Share your thoughts..."
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            disabled={isLoading}
          />
          {errors.content && (
            <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {content?.length || 0}/1000 characters
          </div>
          <button
            type="submit"
            disabled={isLoading || !content?.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>
    </div>
  );
} 