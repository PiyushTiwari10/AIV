/// <reference types="../../types/express-session" />
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, username } = req.body;

      // Validate input
      if (!email || !password || !username) {
        res.status(400).json({ success: false, error: 'Email, password, and username are required' });
        return;
      }

      const user = await AuthService.register(email, password, username);
      
      // Set session
      req.session.userId = user.id;
      
      res.status(201).json({ 
        success: true, 
        data: { 
          user: { 
            id: user.id.toString(), 
            username: user.name, 
            email: user.email, 
            createdAt: user.created_at 
          }, 
          token: 'session-token' 
        } 
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        res.status(400).json({ success: false, error: 'Email and password are required' });
        return;
      }

      const user = await AuthService.login(email, password);
      
      // Set session
      req.session.userId = user.id;
      
      res.json({ 
        success: true, 
        data: { 
          user: { 
            id: user.id.toString(), 
            username: user.name, 
            email: user.email, 
            createdAt: user.created_at 
          }, 
          token: 'session-token' 
        } 
      });
    } catch (error: any) {
      res.status(401).json({ success: false, error: error.message });
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ error: 'Error logging out' });
        return;
      }
      res.json({ message: 'Logout successful' });
    });
  }

  static async getMe(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.session.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const user = await AuthService.getUserById(userId);
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      res.json({ 
        success: true, 
        data: { 
          id: user.id.toString(), 
          username: user.name, 
          email: user.email, 
          createdAt: user.created_at 
        } 
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
