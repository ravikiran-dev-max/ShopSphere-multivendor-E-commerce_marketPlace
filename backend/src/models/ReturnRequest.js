import mongoose from 'mongoose';

const returnRequestSchema = new mongoose.Schema(
  {
    returnNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    parentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    sellerOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SellerOrder',
      required: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        variant: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant' },
        quantity: { type: Number, required: true },
      },
    ],
    reason: {
      type: String,
      required: [true, 'Return reason is required'],
    },
    comments: String,
    images: [String],
    status: {
      type: String,
      enum: [
        'REQUESTED',
        'APPROVED',
        'REJECTED',
        'PICKUP_SCHEDULED',
        'RECEIVED',
        'INSPECTED',
        'REFUND_INITIATED',
        'COMPLETED',
      ],
      default: 'REQUESTED',
      index: true,
    },
    adminNote: String,
  },
  { timestamps: true }
);

const ReturnRequest = mongoose.model('ReturnRequest', returnRequestSchema);

export default ReturnRequest;
