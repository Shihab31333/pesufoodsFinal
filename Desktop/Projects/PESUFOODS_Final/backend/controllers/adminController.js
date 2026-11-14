import User from '../models/User.js';
import Canteen from '../models/Canteen.js';
import MenuItem from '../models/MenuItem.js';
import Order from '../models/Order.js';

export async function dashboard(_req, res) {
  const [canteens, foodItems, customers, orders, revenue, lowStock] = await Promise.all([
    Canteen.countDocuments(), MenuItem.countDocuments(), User.countDocuments({ role: 'customer' }),
    Order.countDocuments(), Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    MenuItem.find({ stock: { $lte: 5 } }).populate('canteen').sort('stock')
  ]);
  res.json({ success: true, stats: { canteens, foodItems, customers, orders, revenue: revenue[0]?.total || 0 }, lowStock });
}
export async function users(_req, res) { res.json({ success: true, users: await User.find({ role: 'customer' }).select('-password').sort('-createdAt') }); }
export async function inventory(_req, res) { res.json({ success: true, items: await MenuItem.find().populate('canteen').sort('stock') }); }
