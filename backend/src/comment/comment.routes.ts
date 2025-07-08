import { Router } from 'express';
import { CommentController } from './comment.controller';
import { requireAuth } from '../auth/auth.middleware';

export default function createCommentRoutes(commentController: CommentController): Router {
  const router = Router();

  // Create a new comment - requires authentication
  router.post('/', requireAuth, (req, res) => commentController.createComment(req, res));

  // Get all comments - public
  router.get('/', (req, res) => commentController.getAllComments(req, res));

  // Get a specific comment by ID - public
  router.get('/:id', (req, res) => commentController.getCommentById(req, res));

  // Update a comment - requires authentication
  router.put('/:id', requireAuth, (req, res) => commentController.updateComment(req, res));

  // Delete a comment - requires authentication
  router.delete('/:id', requireAuth, (req, res) => commentController.deleteComment(req, res));

  return router;
} 