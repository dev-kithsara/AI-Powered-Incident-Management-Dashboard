const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

const auditLogger = async (req, res, next) => {
  if (!MUTATING_METHODS.includes(req.method)) return next();

  res.on('finish', async () => {
    if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
      try {
        const entityType = req.path.split('/')[1] || 'unknown';
        const entityId   = parseInt(req.params?.id) || null;
        await prisma.auditLog.create({
          data: {
            userId:     req.user.id,
            action:     req.method,
            entityType,
            entityId,
            ipAddress:  (req.ip || '').replace('::ffff:', '')
          }
        });
      } catch (_) { /* non-fatal — audit failure must never break the request */ }
    }
  });

  next();
};

module.exports = { auditLogger };
