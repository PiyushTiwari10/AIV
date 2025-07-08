import pool from '../config/db';

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  created_at: Date;
}

export class UserModel {
  static async create(email: string, password: string, name: string): Promise<User> {
    const result = await pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *',
      [email, password, name]
    );
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }
}
