import mongoose from 'mongoose';

const deliveryPartnerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // User with role DELIVERY
      required: true,
      unique: true,
      index: true,
    },
    vehicleType: {
      type: String,
      enum: ['BIKE', 'SCOOTER', 'VAN', 'TRUCK'],
      default: 'BIKE',
    },
    licenseNumber: {
      type: String,
      required: true,
    },
    serviceAreaZipCodes: [String],
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    currentLocation: {
      latitude: Number,
      longitude: Number,
    },
    activeDeliveriesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const DeliveryPartner = mongoose.model('DeliveryPartner', deliveryPartnerSchema);

export default DeliveryPartner;
