import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema(
  {
    trackingCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    parentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    sellerOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SellerOrder',
      required: true,
      index: true,
    },
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // User with role DELIVERY
      index: true,
    },
    pickupAddress: {
      storeName: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
    deliveryAddress: {
      fullName: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
    status: {
      type: String,
      enum: ['ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'],
      default: 'ASSIGNED',
      index: true,
    },
    otpVerificationCode: String,
    proofOfDeliveryImage: String,
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,
  },
  { timestamps: true }
);

const Delivery = mongoose.model('Delivery', deliverySchema);

export default Delivery;
