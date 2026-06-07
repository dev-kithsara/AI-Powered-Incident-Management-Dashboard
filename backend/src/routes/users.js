const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

router.use(authenticate);

// List all users (admin/incident_manager only)
router.get('/', authorize('admin', 'incident_manager'), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true }
    });
    res.json({ data: users });
  } catch (err) { next(err); }
});

// Update own profile
router.put('/me', async (req, res, next) => {
  try {
    const schema  = z.object({ name: z.string().min(2).optional(), email: z.string().email().optional() });
    const data    = schema.parse(req.body);
    const updated = await prisma.user.update({ where: { id: req.user.id }, data });
    const { password: _, ...safe } = updated;
    res.json({ data: safe });
  } catch (err) { next(err); }
});

// Change password
router.put('/me/password', async (req, res, next) => {
  try {
    const schema = z.object({
      currentPassword: z.string(),
      newPassword:     z.string().min(6)
    });
    const { currentPassword, newPassword } = schema.parse(req.body);
    const valid = await bcrypt.compare(currentPassword, req.user.password);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    res.json({ message: 'Password updated successfully' });
  } catch (err) { next(err); }
});

// Create user (admin only)
router.post('/', authorize('admin'), async (req, res, next) => {
  try {
    const schema = z.object({
      name:     z.string().min(2),
      email:    z.string().email(),
      password: z.string().min(6),
      role:     z.enum(['admin', 'incident_manager', 'investigator', 'risk_analyst', 'safety_officer', 'staff'])
    });
    const data   = schema.parse(req.body);
    const hashed = await bcrypt.hash(data.password, 10);
    const user   = await prisma.user.create({ data: { ...data, password: hashed } });
    const { password: _, ...safe } = user;
    res.status(201).json({ data: safe });
  } catch (err) { next(err); }
});

// Update user role (admin only)
router.put('/:id/role', authorize('admin'), async (req, res, next) => {
  try {
    const schema = z.object({ role: z.enum(['admin', 'incident_manager', 'investigator', 'risk_analyst', 'safety_officer', 'staff']) });
    const { role } = schema.parse(req.body);
    const user     = await prisma.user.update({ where: { id: parseInt(req.params.id) }, data: { role } });
    const { password: _, ...safe } = user;
    res.json({ data: safe });
  } catch (err) { next(err); }
});

// Toggle user active status (admin only)
router.put('/:id/toggle-active', authorize('admin'), async (req, res, next) => {
  try {
    const current = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!current) return res.status(404).json({ error: 'User not found' });
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data:  { isActive: !current.isActive }
    });
    const { password: _, ...safe } = user;
    res.json({ data: safe });
  } catch (err) { next(err); }
});

module.exports = router;
