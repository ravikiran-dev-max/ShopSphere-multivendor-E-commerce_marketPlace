import express from 'express';
import { createTicket, getTickets, replyToTicket } from '../controllers/supportController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/tickets', createTicket);
router.get('/tickets', getTickets);
router.post('/tickets/:id/reply', replyToTicket);

export default router;
