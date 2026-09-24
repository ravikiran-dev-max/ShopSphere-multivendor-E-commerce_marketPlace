import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'ORDER_STATUS',
        'RETURN_UPDATE',
        'REFUND_UPDATE',
        'SELLER_APPROVAL',
        'LOW_STOCK',
        'SUPPORT_UPDATE',
        'PROMOTION',
      ],
      default: 'ORDER_STATUS',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    link: String,
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
