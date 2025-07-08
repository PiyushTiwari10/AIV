import { Router } from 'express';
import { AuthController } from './auth.controller';
import { requireAuth } from './auth.middleware';

const router = Router();

// Public routes
router.post('/register', (req, res) => AuthController.register(req, res));
router.post('/login', (req, res) => AuthController.login(req, res));
router.post('/logout', (req, res) => AuthController.logout(req, res));

// Protected routes
router.get('/me', requireAuth, (req, res) => AuthController.getMe(req, res));

export default router;