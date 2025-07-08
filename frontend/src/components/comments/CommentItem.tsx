'use client';

import { useState } from 'react';
import { Comment } from '@/types';

interface CommentItemProps {
  comment: Comment;
  isOwnComment: boolean;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

export default function CommentItem({
  comment,
  isOwnComment,
  onEdit,
  onDelete,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const handleEdit = () => {
    if (editContent.trim() !== comment.content) {
      onEdit(comment.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-semibold text-gray-900">{comment.username}</span>
            <span className="text-xs text-gray-500">
              {formatDate(comment.createdAt)}
            </span>
            {comment.updatedAt !== comment.createdAt && (
              <span className="text-xs text-gray-400">(edited)</span>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                autoFocus
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          )}
        </div>

        {isOwnComment && !isEditing && (
          <div className="flex space-x-2 ml-4">
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-500 hover:text-blue-700 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(comment.id)}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 