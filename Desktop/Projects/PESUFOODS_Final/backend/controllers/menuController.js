import MenuItem from '../models/MenuItem.js';
import { ApiError } from '../utils/ApiError.js';

const queryItems = (query) => {
  const filter = {};
  if (query.canteen) filter.canteen = query.canteen;
  if (query.category) filter.category = query.category;
  if (query.available === 'true') filter.isAvailable = true;
  if (query.q) filter.$or = [{ name: new RegExp(query.q, 'i') }, { description: new RegExp(query.q, 'i') }];
  return filter;
};
export async function listMenu(req, res) {
  const sort = req.query.sort === 'price' ? { price: 1 } : req.query.sort === 'name' ? { name: 1 } : { createdAt: -1 };
  const items = await MenuItem.find(queryItems(req.query)).populate('canteen').sort(sort);
  res.json({ success: true, items });
}
export async function getMenuItem(req, res) {
  const item = await MenuItem.findById(req.params.id).populate('canteen');
  if (!item) throw new ApiError(404, 'Menu item not found');
  res.json({ success: true, item });
}
export async function createMenuItem(req, res) { res.status(201).json({ success: true, item: await MenuItem.create(req.body) }); }
export async function updateMenuItem(req, res) {
  const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) throw new ApiError(404, 'Menu item not found');
  res.json({ success: true, item });
}
export async function deleteMenuItem(req, res) {
  if (!await MenuItem.findByIdAndDelete(req.params.id)) throw new ApiError(404, 'Menu item not found');
  res.json({ success: true, message: 'Menu item deleted' });
}
