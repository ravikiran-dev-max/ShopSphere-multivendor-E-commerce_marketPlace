import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['RAZORPAY', 'STRIPE', 'MOCK_GATEWAY', 'COD'],
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    providerOrderId: String,
    providerSignature: String,
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'],
      default: 'PENDING',
      index: true,
    },
    paymentGatewayLog: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
