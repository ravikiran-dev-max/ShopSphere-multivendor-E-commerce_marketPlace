import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshSession,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  changePassword,
} from '../controllers/authController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', authenticateUser, logoutUser);
router.post('/refresh-token', refreshSession);
router.get('/me', authenticateUser, getCurrentUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/change-password', authenticateUser, changePassword);

export default router;
