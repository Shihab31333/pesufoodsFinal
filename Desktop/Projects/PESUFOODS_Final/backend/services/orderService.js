import mongoose from 'mongoose';
import MenuItem from '../models/MenuItem.js';
import Order from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';

export async function checkout({ userId, canteenId, items, idempotencyKey }) {
  if (!idempotencyKey) throw new ApiError(400, 'Idempotency key is required');
  if (!Array.isArray(items) || items.length === 0) throw new ApiError(400, 'Cart cannot be empty');
  const session = await mongoose.startSession();
  try {
    const existing = await Order.findOne({ user: userId, idempotencyKey }).session(session);
    if (existing) {
      await existing.populate({ path: 'canteen', options: { session } });
      return existing;
    }

    let order;
    await session.withTransaction(async () => {
      const snapshots = [];
      for (const requested of items) {
        const quantity = Number(requested.quantity);
        if (!Number.isInteger(quantity) || quantity < 1) throw new ApiError(400, 'Invalid item quantity');
        const item = await MenuItem.findOneAndUpdate(
          { _id: requested.itemId, canteen: canteenId, isAvailable: true, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { new: true, session }
        ).populate('canteen');
        if (!item) throw new ApiError(409, 'One or more items are unavailable or out of stock');
        snapshots.push({ item: item._id, name: item.name, price: item.price, quantity });
      }
      const subtotal = snapshots.reduce((sum, item) => sum + item.price * item.quantity, 0);
      [order] = await Order.create([{
        user: userId, canteen: canteenId, items: snapshots, subtotal, totalAmount: subtotal,
        paymentStatus: 'paid', orderStatus: 'Placed', idempotencyKey
      }], { session });
    });
    await order.populate({ path: 'canteen', options: { session } });
    return order;
  } finally {
    await session.endSession();
  }
}
