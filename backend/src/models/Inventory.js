import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductVariant',
      default: null,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    reservedQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    history: [
      {
        action: {
          type: String,
          enum: ['RESTOCK', 'RESERVED', 'FULFILLED', 'RETURN_RESTOCK', 'MANUAL_ADJUSTMENT'],
          required: true,
        },
        quantityChanged: { type: Number, required: true },
        previousQuantity: { type: Number, required: true },
        newQuantity: { type: Number, required: true },
        reason: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Virtual property for available quantity
inventorySchema.virtual('availableQuantity').get(function () {
  return Math.max(0, this.stockQuantity - this.reservedQuantity);
});

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
