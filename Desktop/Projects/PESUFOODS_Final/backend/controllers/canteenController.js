import Canteen from '../models/Canteen.js';
import { ApiError } from '../utils/ApiError.js';

export async function listCanteens(_req, res) {
  res.json({ success: true, canteens: await Canteen.find({ isActive: true }).sort('name') });
}
export async function getCanteen(req, res) {
  const canteen = await Canteen.findById(req.params.id);
  if (!canteen) throw new ApiError(404, 'Canteen not found');
  res.json({ success: true, canteen });
}
export async function createCanteen(req, res) { res.status(201).json({ success: true, canteen: await Canteen.create(req.body) }); }
export async function updateCanteen(req, res) {
  const canteen = await Canteen.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!canteen) throw new ApiError(404, 'Canteen not found');
  res.json({ success: true, canteen });
}
export async function deleteCanteen(req, res) {
  const canteen = await Canteen.findByIdAndDelete(req.params.id);
  if (!canteen) throw new ApiError(404, 'Canteen not found');
  res.json({ success: true, message: 'Canteen deleted' });
}
