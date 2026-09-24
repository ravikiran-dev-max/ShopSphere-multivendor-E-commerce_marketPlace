import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  updateUserProfile,
} from '../controllers/userController.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.put('/profile', authenticateUser, updateUserProfile);
router.get('/', requireAdmin, getAllUsers);
router.get('/:id', authenticateUser, getUserById);
router.patch('/:id/status', requireAdmin, updateUserStatus);
router.patch('/:id/role', requireAdmin, updateUserRole);

export default router;
