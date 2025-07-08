import { Request, Response } from 'express';
import { CommentService } from './comment.service';
import { CreateCommentRequest } from './comment.model';
import { WebSocketServer } from '../ws/ws.server';
import { AuthService } from '../auth/auth.service';
import redis from '../config/redis';

export class CommentController {
  private commentService: CommentService;

  constructor(commentService: CommentService) {
    this.commentService = commentService;
  }

  async createComment(req: Request, res: Response): Promise<void> {
    try {
      const { content } = req.body;
      
      // Get user from session
      const userId = (req.session as any)?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      // Get user details
      const user = await AuthService.getUserById(userId);
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      const commentData: CreateCommentRequest = {
        content,
        user_id: userId
      };

      const comment = await this.commentService.createComment(commentData);
      
      // Invalidate Redis cache for comments
      await redis.del('comments:latest');
      
      // Transform the comment data
      const transformedComment = {
        id: comment.id.toString(),
        content: comment.content,
        userId: comment.user_id.toString(),
        username: comment.username || user.name,
        createdAt: comment.created_at ? new Date(comment.created_at).toISOString() : new Date().toISOString(),
        updatedAt: comment.updated_at ? new Date(comment.updated_at).toISOString() : new Date().toISOString()
      };
      
      // Broadcast new comment to all connected clients
      const wsServer = (global as any).wsServer;
      if (wsServer) {
        wsServer.broadcastNewComment(transformedComment);
      }
      
      res.status(201).json({
        success: true,
        data: transformedComment
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create comment'
      });
    }
  }

  async getAllComments(req: Request, res: Response): Promise<void> {
    try {
      const cacheKey = 'comments:latest';
      const cached = await redis.get(cacheKey);

      if (cached) {
        // If cached, return the cached data
        res.status(200).json({
          success: true,
          data: JSON.parse(cached)
        });
        return;
      }

      // Not cached: fetch from DB
      const comments = await this.commentService.getAllComments();

      // Transform the data to match frontend expectations
      const transformedComments = comments.map(comment => ({
        id: comment.id.toString(),
        content: comment.content,
        userId: comment.user_id.toString(),
        username: comment.username || 'Unknown User',
        createdAt: comment.created_at ? new Date(comment.created_at).toISOString() : new Date().toISOString(),
        updatedAt: comment.updated_at ? new Date(comment.updated_at).toISOString() : new Date().toISOString()
      }));

      // Store in Redis for 10 seconds
      await redis.set(cacheKey, JSON.stringify(transformedComments), 'EX', 10);

      res.status(200).json({
        success: true,
        data: transformedComments
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch comments'
      });
    }
  }

  async getCommentById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid comment ID'
        });
        return;
      }

      const comment = await this.commentService.getCommentById(id);
      
      if (!comment) {
        res.status(404).json({
          success: false,
          error: 'Comment not found'
        });
        return;
      }

      // Transform the comment data
      const transformedComment = {
        id: comment.id.toString(),
        content: comment.content,
        userId: comment.user_id.toString(),
        username: comment.username || 'Unknown User',
        createdAt: comment.created_at ? new Date(comment.created_at).toISOString() : new Date().toISOString(),
        updatedAt: comment.updated_at ? new Date(comment.updated_at).toISOString() : new Date().toISOString()
      };

      res.status(200).json({
        success: true,
        data: transformedComment
      });
    } catch (error) {
      console.error('Error fetching comment:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch comment'
      });
    }
  }

  async updateComment(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { content } = req.body;
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid comment ID'
        });
        return;
      }

      // Get user from session
      const userId = (req.session as any)?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      // Get user details
      const user = await AuthService.getUserById(userId);
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      const comment = await this.commentService.updateComment(id, content, userId);
      
      if (!comment) {
        res.status(404).json({
          success: false,
          error: 'Comment not found'
        });
        return;
      }

      // Transform the comment data
      const transformedComment = {
        id: comment.id.toString(),
        content: comment.content,
        userId: comment.user_id.toString(),
        username: comment.username || user.name,
        createdAt: comment.created_at ? new Date(comment.created_at).toISOString() : new Date().toISOString(),
        updatedAt: comment.updated_at ? new Date(comment.updated_at).toISOString() : new Date().toISOString()
      };

      // Broadcast comment update to all connected clients
      const wsServer = (global as any).wsServer;
      if (wsServer) {
        wsServer.broadcastCommentUpdate(transformedComment);
      }

      res.status(200).json({
        success: true,
        data: transformedComment
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update comment'
      });
    }
  }

  async deleteComment(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid comment ID'
        });
        return;
      }

      // Get user from session
      const userId = (req.session as any)?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const deleted = await this.commentService.deleteComment(id, userId);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Comment not found'
        });
        return;
      }

      // Broadcast comment deletion to all connected clients
      const wsServer = (global as any).wsServer;
      if (wsServer) {
        wsServer.broadcastCommentDelete(id.toString());
      }

      res.status(200).json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete comment'
      });
    }
  }
}
