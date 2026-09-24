import express from 'express';
import {
  createBrand,
  getAllBrands,
  getBrandBySlug,
  updateBrand,
  deleteBrand,
} from '../controllers/brandController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllBrands);
router.get('/:slug', getBrandBySlug);
router.post('/', requireAdmin, createBrand);
router.put('/:id', requireAdmin, updateBrand);
router.delete('/:id', requireAdmin, deleteBrand);

export default router;
