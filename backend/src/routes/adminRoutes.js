import express from 'express';
import { getAdminOverviewStats, getAuditLogs } from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAdmin);

router.get('/overview', getAdminOverviewStats);
router.get('/audit-logs', getAuditLogs);

export default router;
