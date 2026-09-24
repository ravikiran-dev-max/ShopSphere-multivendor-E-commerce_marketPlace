import mongoose from 'mongoose';

const settlementSchema = new mongoose.Schema(
  {
    settlementNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    totalOrdersCount: {
      type: Number,
      default: 0,
    },
    grossSalesAmount: {
      type: Number,
      required: true,
    },
    platformCommissionAmount: {
      type: Number,
      required: true,
    },
    refundDeductions: {
      type: Number,
      default: 0,
    },
    netPayoutAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'PAID', 'ON_HOLD'],
      default: 'PENDING',
      index: true,
    },
    transactionReference: String,
    paidAt: Date,
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      bankName: String,
      ifscCode: String,
    },
  },
  { timestamps: true }
);

const Settlement = mongoose.model('Settlement', settlementSchema);

export default Settlement;
