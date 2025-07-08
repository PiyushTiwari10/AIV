import { CommentModel, Comment, CreateCommentRequest } from './comment.model';

export class CommentService {
  private commentModel: CommentModel;

  constructor(commentModel: CommentModel) {
    this.commentModel = commentModel;
  }

  async createComment(commentData: CreateCommentRequest): Promise<Comment> {
    if (!commentData.content || commentData.content.trim().length === 0) {
      throw new Error('Comment content cannot be empty');
    }

    if (!commentData.user_id) {
      throw new Error('User ID is required');
    }

    return await this.commentModel.create(commentData);
  }

  async getAllComments(): Promise<Comment[]> {
    return await this.commentModel.findAll();
  }

  async getCommentById(id: number): Promise<Comment | null> {
    if (!id || id <= 0) {
      throw new Error('Invalid comment ID');
    }

    return await this.commentModel.findById(id);
  }

  async updateComment(id: number, content: string, userId: number): Promise<Comment | null> {
    if (!id || id <= 0) {
      throw new Error('Invalid comment ID');
    }

    if (!content || content.trim().length === 0) {
      throw new Error('Comment content cannot be empty');
    }

    // Check if comment exists and belongs to user
    const existingComment = await this.commentModel.findById(id);
    if (!existingComment) {
      throw new Error('Comment not found');
    }

    if (existingComment.user_id !== userId) {
      throw new Error('You can only update your own comments');
    }

    return await this.commentModel.update(id, content);
  }

  async deleteComment(id: number, userId: number): Promise<boolean> {
    if (!id || id <= 0) {
      throw new Error('Invalid comment ID');
    }

    // Check if comment exists and belongs to user
    const existingComment = await this.commentModel.findById(id);
    if (!existingComment) {
      throw new Error('Comment not found');
    }

    if (existingComment.user_id !== userId) {
      throw new Error('You can only delete your own comments');
    }

    return await this.commentModel.delete(id);
  }
}
