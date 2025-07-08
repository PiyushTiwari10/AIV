'use client';

import { Comment } from '@/types';
import CommentItem from './CommentItem';

interface CommentListProps {
  comments: Comment[];
  currentUserId: string;
  onEditComment: (id: string, content: string) => void;
  onDeleteComment: (id: string) => void;
}

export default function CommentList({
  comments,
  currentUserId,
  onEditComment,
  onDeleteComment,
}: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-lg">No comments yet</p>
        <p className="text-sm">Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment, index) => (
        <CommentItem
          key={comment.id || `comment-${index}`}
          comment={comment}
          isOwnComment={comment.userId === currentUserId}
          onEdit={onEditComment}
          onDelete={onDeleteComment}
        />
      ))}
    </div>
  );
} 