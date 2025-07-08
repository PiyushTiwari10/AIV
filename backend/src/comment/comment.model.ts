import { Pool } from 'pg';

export interface Comment {
  id: number;
  content: string;
  user_id: number;
  username?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCommentRequest {
  content: string;
  user_id: number;
}

export class CommentModel {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async createTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        char_count INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await this.pool.query(query);
  }

  async create(comment: CreateCommentRequest): Promise<Comment> {
    const query = `
      INSERT INTO comments (content, user_id, char_count)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await this.pool.query(query, [comment.content, comment.user_id, comment.content.length]);
    return result.rows[0];
  }

  async findAll(): Promise<Comment[]> {
    const query = `
      SELECT c.*, u.name as username 
      FROM comments c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
    `;
    const result = await this.pool.query(query);
    return result.rows;
  }

  async findById(id: number): Promise<Comment | null> {
    const query = `
      SELECT c.*, u.name as username 
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `;
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async update(id: number, content: string): Promise<Comment | null> {
    const query = `
      UPDATE comments 
      SET content = $1, char_count = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    const result = await this.pool.query(query, [content, content.length, id]);
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM comments WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
