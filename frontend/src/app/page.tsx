'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Comment, User, TypingIndicator, ActiveUser } from '@/types';
import { commentsAPI, authAPI } from '@/lib/api';
import { websocketClient } from '@/lib/websocket';
import CommentList from '@/components/comments/CommentList';
import CommentForm from '@/components/comments/CommentForm';
import TypingIndicatorComponent from '@/components/comments/TypingIndicator';
import ActiveUsersSidebar from '@/components/comments/ActiveUsersSidebar';

export default function HomePage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadComments();
  }, []);

  useEffect(() => {
    if (currentUser) {
      setupWebSocket();
    }
  }, [currentUser]);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const user = await authAPI.getProfile();
      setCurrentUser(user);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const fetchedComments = await commentsAPI.getComments();
      setComments(fetchedComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const setupWebSocket = () => {
    if (!currentUser) return;

    setConnectionStatus('connecting');
    websocketClient.connect(currentUser.username);

    // User join/leave events
    websocketClient.onUserJoin((data) => {
      console.log(`${data.username} joined the chat`);
    });

    websocketClient.onUserLeave((data) => {
      console.log(`${data.username} left the chat`);
      // Remove user from typing indicators if they disconnect
      setTypingUsers(prev => prev.filter(user => user.userId !== data.userId));
    });

    // Typing indicators
    websocketClient.onTypingIndicator((data) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(user => user.userId !== data.userId);
        if (data.isTyping) {
          return [...filtered, {
            userId: data.userId,
            username: data.username,
            isTyping: true
          }];
        }
        return filtered;
      });
    });

    // Active users
    websocketClient.onActiveUsers((users) => {
      setActiveUsers(users);
    });

    // New comment events
    websocketClient.onNewComment((newComment) => {
      setComments(prev => {
        // Check if comment already exists
        const exists = prev.some(comment => comment.id === newComment.id);
        if (!exists) {
          return [newComment, ...prev];
        }
        return prev;
      });
    });

    websocketClient.onCommentUpdated((updatedComment) => {
      setComments(prev => 
        prev.map(comment => 
          comment.id === updatedComment.id ? updatedComment : comment
        )
      );
    });

    websocketClient.onCommentDeleted((data) => {
      setComments(prev => prev.filter(comment => comment.id !== data.id));
    });

    // Check connection status
    const checkConnection = () => {
      setConnectionStatus(websocketClient.isConnected() ? 'connected' : 'disconnected');
    };

    const interval = setInterval(checkConnection, 1000);
    return () => {
      clearInterval(interval);
      websocketClient.disconnect();
    };
  };

  const handlePostComment = async (content: string) => {
    if (!currentUser) return;

    setIsPosting(true);
    try {
      await commentsAPI.createComment(content);
      // The new comment will be added via WebSocket event
    } catch (error) {
      console.error('Failed to post comment:', error);
      // Reload comments to ensure consistency
      await loadComments();
    } finally {
      setIsPosting(false);
    }
  };

  const handleEditComment = async (id: string, content: string) => {
    try {
      await commentsAPI.updateComment(id, content);
      // The updated comment will be reflected via WebSocket event
    } catch (error) {
      console.error('Failed to update comment:', error);
      await loadComments();
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      await commentsAPI.deleteComment(id);
      // The deleted comment will be removed via WebSocket event
    } catch (error) {
      console.error('Failed to delete comment:', error);
      await loadComments();
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      websocketClient.disconnect();
      router.push('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Collaborative Comments
              </h1>
              <p className="text-sm text-gray-600">
                Real-time collaboration with {currentUser.username}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' :
                  connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-600">
                  {connectionStatus === 'connected' ? 'Connected' :
                   connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
                </span>
              </div>
              
              {/* Active Users Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>{activeUsers.length}</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Comment Form */}
          <CommentForm onSubmit={handlePostComment} isLoading={isPosting} />

          {/* Typing Indicator */}
          <TypingIndicatorComponent
            typingUsers={typingUsers}
            currentUserId={currentUser.id}
          />

          {/* Comments List */}
          <CommentList
            comments={comments}
            currentUserId={currentUser.id}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
          />
        </div>
      </main>

      {/* Active Users Sidebar */}
      <ActiveUsersSidebar
        activeUsers={activeUsers}
        currentUserId={currentUser.id}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
    </div>
  );
}
