import mongoose from 'mongoose';

const refundSchema = new mongoose.Schema(
  {
    refundNumber: {
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
    },
    returnRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReturnRequest',
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
    },
    amount: {
      type: Number,
      required: true,
    },
    refundMethod: {
      type: String,
      enum: ['ORIGINAL_PAYMENT', 'WALLET', 'STORE_CREDIT'],
      default: 'ORIGINAL_PAYMENT',
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
      index: true,
    },
    gatewayRefundId: String,
    processedAt: Date,
  },
  { timestamps: true }
);

const Refund = mongoose.model('Refund', refundSchema);

export default Refund;
