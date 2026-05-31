const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { z }   = require('zod');
const prisma  = new PrismaClient();

const registerSchema = z.object({
  name:     z.string().min(2).max(100),
  email:    z.string().email(),
  password: z.string().min(6).max(100),
  role:     z.enum(['admin', 'manager', 'staff']).optional().default('staff')
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1)
});

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

exports.register = async (req, res, next) => {
  try {
    const data     = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const hashed  = await bcrypt.hash(data.password, 10);
    const user    = await prisma.user.create({ data: { ...data, password: hashed } });
    const { password: _, ...safe } = user;
    res.status(201).json({ token: signToken(user.id), user: safe });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive)  return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const { password: _, ...safe } = user;
    res.json({ token: signToken(user.id), user: safe });
  } catch (err) { next(err); }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token required' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ error: 'User not found' });
    res.json({ token: signToken(user.id) });
  } catch (err) { next(err); }
};

exports.getMe = async (req, res) => {
  const { password: _, ...safe } = req.user;
  res.json({ user: safe });
};
