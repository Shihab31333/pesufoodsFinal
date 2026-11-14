import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import { checkout } from '../services/orderService.js';
import { ApiError } from '../utils/ApiError.js';

export async function createOrder(req, res) {
  const order = await checkout({ userId: req.user._id, ...req.body });
  res.status(201).json({ success: true, order });
}
export async function myOrders(req, res) {
  res.json({ success: true, orders: await Order.find({ user: req.user._id }).populate('canteen').sort('-createdAt') });
}
export async function allOrders(req, res) {
  const filter = {};
  if (req.query.status) filter.orderStatus = req.query.status;
  if (req.query.canteen) filter.canteen = req.query.canteen;
  res.json({ success: true, orders: await Order.find(filter).populate('user', 'name email').populate('canteen').sort('-createdAt') });
}
export async function updateStatus(req, res) {
  const allowed = ['Placed', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'];
  if (!allowed.includes(req.body.status)) throw new ApiError(400, 'Invalid order status');
  const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: req.body.status }, { new: true });
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ success: true, order });
}
export async function cancelOrder(req, res) {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw new ApiError(404, 'Order not found');
  if (['Completed', 'Cancelled'].includes(order.orderStatus)) throw new ApiError(409, 'Order cannot be cancelled');
  if (!order.inventoryRestored) {
    for (const item of order.items) await MenuItem.updateOne({ _id: item.item }, { $inc: { stock: item.quantity } });
    order.inventoryRestored = true;
  }
  order.orderStatus = 'Cancelled'; order.paymentStatus = 'refunded'; await order.save();
  res.json({ success: true, order });
}
