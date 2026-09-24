import express from 'express';
import {
  createCategory,
  getAllCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllCategories);
router.get('/:slug', getCategoryBySlug);
router.post('/', requireAdmin, createCategory);
router.put('/:id', requireAdmin, updateCategory);
router.delete('/:id', requireAdmin, deleteCategory);

export default router;
