import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { generateToken } from '../utils/generateToken.js';

const cookieOptions = { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 };

export async function signup(req, res) {
  const { name, email, password, confirmPassword } = req.body;
  if (!name || !email || !password || password !== confirmPassword) throw new ApiError(400, 'Provide valid details and matching passwords');
  if (password.length < 8) throw new ApiError(400, 'Password must be at least 8 characters');
  if (await User.exists({ email: email.toLowerCase() })) throw new ApiError(409, 'Email is already registered');
  const user = await User.create({ name, email, password });
  res.status(201).json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(password || '', user.password))) throw new ApiError(401, 'Invalid email or password');
  res.cookie('token', generateToken(user), cookieOptions).json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}

export function logout(_req, res) {
  res.clearCookie('token', cookieOptions).json({ success: true, message: 'Logged out' });
}

export function me(req, res) {
  res.json({ success: true, user: req.user });
}
