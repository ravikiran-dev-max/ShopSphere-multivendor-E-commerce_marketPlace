import SupportTicket from '../models/SupportTicket.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createTicket = asyncHandler(async (req, res) => {
  const { subject, description, priority, orderId } = req.body;

  if (!subject || !description) {
    throw new ApiError(400, 'Subject and description are required.');
  }

  const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`;

  const ticket = await SupportTicket.create({
    ticketNumber,
    customer: req.user._id,
    order: orderId || null,
    subject,
    description,
    priority: priority || 'MEDIUM',
    messages: [
      {
        sender: req.user._id,
        message: description,
      },
    ],
  });

  res.status(201).json(new ApiResponse(201, ticket, 'Support ticket created successfully.'));
});

export const getTickets = asyncHandler(async (req, res) => {
  const query = {};
  if (req.user.role === 'CUSTOMER') {
    query.customer = req.user._id;
  } else if (req.user.role === 'SUPPORT') {
    query.$or = [{ assignedAgent: req.user._id }, { assignedAgent: null }];
  }

  const tickets = await SupportTicket.find(query)
    .populate('customer', 'name email')
    .populate('assignedAgent', 'name email')
    .sort({ updatedAt: -1 });

  res.status(200).json(new ApiResponse(200, tickets, 'Support tickets retrieved.'));
});

export const replyToTicket = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message) {
    throw new ApiError(400, 'Reply message is required.');
  }

  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) {
    throw new ApiError(404, 'Ticket not found.');
  }

  ticket.messages.push({
    sender: req.user._id,
    message,
  });

  if (req.user.role === 'SUPPORT' || req.user.role === 'ADMIN') {
    ticket.status = 'WAITING_FOR_CUSTOMER';
    if (!ticket.assignedAgent) {
      ticket.assignedAgent = req.user._id;
    }
  } else {
    ticket.status = 'IN_PROGRESS';
  }

  await ticket.save();

  res.status(200).json(new ApiResponse(200, ticket, 'Reply added to support ticket.'));
});
