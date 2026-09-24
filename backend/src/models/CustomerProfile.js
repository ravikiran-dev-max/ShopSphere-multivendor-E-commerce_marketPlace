import mongoose from 'mongoose';

const customerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    defaultAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
    },
    savedAddresses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
      },
    ],
    preferredCurrency: {
      type: String,
      default: 'INR',
    },
  },
  { timestamps: true }
);

const CustomerProfile = mongoose.model('CustomerProfile', customerProfileSchema);

export default CustomerProfile;
