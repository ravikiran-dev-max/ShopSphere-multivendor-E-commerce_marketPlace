import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true, // e.g. "USER_SUSPENDED", "SELLER_APPROVED", "REFUND_APPROVED"
      index: true,
    },
    targetModel: {
      type: String,
      required: true, // e.g. "User", "SellerProfile", "Product"
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    ipAddress: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
