import mongoose from 'mongoose';

const canteenSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  image: { type: String, required: true },
  openingHours: { type: String, required: true },
  isOpen: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  seedKey: { type: String, unique: true, sparse: true }
}, { timestamps: true });

export default mongoose.model('Canteen', canteenSchema);
