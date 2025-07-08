import { io, Socket } from 'socket.io-client';
import { WebSocketMessage, TypingIndicator } from '@/types';

interface ActiveUser {
  id: string;
  username: string;
}

class WebSocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private currentUsername: string = '';

  connect(username: string) {
    if (this.socket?.connected) {
      return;
    }

    this.currentUsername = username;
    this.socket = io('http://localhost:4000', {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to WebSocket server');
      this.reconnectAttempts = 0;
      
      // Join the chat room
      this.socket?.emit('user:join', { username });
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from WebSocket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error);
      this.handleReconnect();
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔌 Reconnected after ${attemptNumber} attempts`);
      this.socket?.emit('user:join', { username });
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`🔌 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.socket?.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Typing indicators
  startTyping() {
    this.socket?.emit('user:typing', { 
      isTyping: true, 
      username: this.currentUsername 
    });
  }

  stopTyping() {
    this.socket?.emit('user:typing', { 
      isTyping: false, 
      username: this.currentUsername 
    });
  }

  // Event listeners
  onUserJoin(callback: (data: { username: string; userId: string }) => void) {
    this.socket?.on('user:joined', callback);
  }

  onUserLeave(callback: (data: { username: string; userId: string }) => void) {
    this.socket?.on('user:left', callback);
  }

  onTypingIndicator(callback: (data: TypingIndicator) => void) {
    this.socket?.on('user:typing', callback);
  }

  onNewComment(callback: (data: any) => void) {
    this.socket?.on('comment:created', callback);
  }

  onCommentUpdated(callback: (data: any) => void) {
    this.socket?.on('comment:updated', callback);
  }

  onCommentDeleted(callback: (data: { id: string }) => void) {
    this.socket?.on('comment:deleted', callback);
  }

  onActiveUsers(callback: (users: ActiveUser[]) => void) {
    this.socket?.on('active:users', callback);
  }

  // Remove event listeners
  offUserJoin() {
    this.socket?.off('user:joined');
  }

  offUserLeave() {
    this.socket?.off('user:left');
  }

  offTypingIndicator() {
    this.socket?.off('user:typing');
  }

  offNewComment() {
    this.socket?.off('comment:created');
  }

  offCommentUpdated() {
    this.socket?.off('comment:updated');
  }

  offCommentDeleted() {
    this.socket?.off('comment:deleted');
  }

  offActiveUsers() {
    this.socket?.off('active:users');
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const websocketClient = new WebSocketClient();
export default websocketClient; 