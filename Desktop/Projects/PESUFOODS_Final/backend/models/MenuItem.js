import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, index: true },
  stock: { type: Number, required: true, min: 0, default: 0 },
  canteen: { type: mongoose.Schema.Types.ObjectId, ref: 'Canteen', required: true, index: true },
  isAvailable: { type: Boolean, default: true },
  seedKey: { type: String, unique: true, sparse: true }
}, { timestamps: true });

menuItemSchema.index({ name: 'text', description: 'text', category: 'text' });
export default mongoose.model('MenuItem', menuItemSchema);
