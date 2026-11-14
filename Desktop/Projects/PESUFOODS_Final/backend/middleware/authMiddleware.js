import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

export async function protect(req, _res, next) {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new ApiError(401, 'Authentication required');
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(payload.id).select('-password');
    if (!req.user) throw new ApiError(401, 'User no longer exists');
    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, 'Invalid or expired token'));
  }
}

export function adminOnly(req, _res, next) {
  if (req.user?.role !== 'admin') return next(new ApiError(403, 'Admin access required'));
  next();
}
