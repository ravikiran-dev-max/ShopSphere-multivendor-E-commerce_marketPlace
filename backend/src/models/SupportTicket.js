import mongoose from 'mongoose';

const supportTicketMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    attachments: [String],
  },
  { timestamps: true }
);

const supportTicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
      index: true,
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // User with role SUPPORT
      index: true,
    },
    messages: [supportTicketMessageSchema],
  },
  { timestamps: true }
);

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

export default SupportTicket;
