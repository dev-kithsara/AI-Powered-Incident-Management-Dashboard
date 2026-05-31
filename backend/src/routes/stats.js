const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const [total, open, inProgress, underReview, closed, bySeverity, byCategory, recent] =
      await Promise.all([
        prisma.incident.count({ where: { deletedAt: null } }),
        prisma.incident.count({ where: { deletedAt: null, status: 'OPEN' } }),
        prisma.incident.count({ where: { deletedAt: null, status: 'IN_PROGRESS' } }),
        prisma.incident.count({ where: { deletedAt: null, status: 'UNDER_REVIEW' } }),
        prisma.incident.count({ where: { deletedAt: null, status: 'CLOSED' } }),
        prisma.incident.groupBy({
          by: ['severity'],
          where: { deletedAt: null },
          _count: { severity: true }
        }),
        prisma.incident.groupBy({
          by: ['category'],
          where: { deletedAt: null, category: { not: null } },
          _count: { category: true },
          orderBy: { _count: { category: 'desc' } },
          take: 5
        }),
        prisma.incident.findMany({
          where:   { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take:    5,
          select:  { id: true, title: true, severity: true, status: true, createdAt: true }
        })
      ]);

    const severityMap = Object.fromEntries(
      bySeverity.map(s => [s.severity, s._count.severity])
    );

    res.json({
      data: {
        total, open, inProgress, underReview, closed,
        bySeverity: {
          LOW:      severityMap.LOW      || 0,
          MEDIUM:   severityMap.MEDIUM   || 0,
          HIGH:     severityMap.HIGH     || 0,
          CRITICAL: severityMap.CRITICAL || 0
        },
        topCategories: byCategory.map(c => ({
          category: c.category,
          count:    c._count.category
        })),
        recentIncidents: recent
      }
    });
  } catch (err) { next(err); }
});

module.exports = router;
