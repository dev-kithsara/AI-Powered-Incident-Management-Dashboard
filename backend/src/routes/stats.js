const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const baseWhere = { deletedAt: null };
    if (req.user.role === 'investigator') {
      baseWhere.investigation = { investigatedBy: req.user.id };
    }

    const promises = [
      prisma.incident.count({ where: baseWhere }),
      prisma.incident.count({ where: { ...baseWhere, status: 'OPEN' } }),
      prisma.incident.count({ where: { ...baseWhere, status: 'IN_PROGRESS' } }),
      prisma.incident.count({ where: { ...baseWhere, status: 'UNDER_REVIEW' } }),
      prisma.incident.count({ where: { ...baseWhere, status: 'CLOSED' } }),
      prisma.incident.groupBy({
        by: ['severity'],
        where: baseWhere,
        _count: { severity: true }
      }),
      prisma.incident.groupBy({
        by: ['category'],
        where: { ...baseWhere, category: { not: null } },
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } },
        take: 5
      }),
      prisma.incident.findMany({
        where:   baseWhere,
        orderBy: { createdAt: 'desc' },
        take:    5,
        select:  { id: true, title: true, severity: true, status: true, createdAt: true }
      })
    ];

    let overdueActionsPromise = Promise.resolve([]);
    let upcomingActionsPromise = Promise.resolve([]);

    if (req.user.role === 'investigator') {
      const now = new Date();
      overdueActionsPromise = prisma.incidentAction.findMany({
        where: {
          assignedTo: req.user.id,
          status: { not: 'COMPLETED' },
          dueDate: { lt: now }
        },
        include: {
          incident: {
            select: { id: true, title: true }
          }
        },
        orderBy: { dueDate: 'asc' }
      });

      upcomingActionsPromise = prisma.incidentAction.findMany({
        where: {
          assignedTo: req.user.id,
          status: { not: 'COMPLETED' },
          dueDate: { gte: now }
        },
        include: {
          incident: {
            select: { id: true, title: true }
          }
        },
        orderBy: { dueDate: 'asc' },
        take: 5
      });
    }

    promises.push(overdueActionsPromise, upcomingActionsPromise);

    const [
      total, open, inProgress, underReview, closed,
      bySeverity, byCategory, recent,
      overdueActions, upcomingActions
    ] = await Promise.all(promises);

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
        recentIncidents: recent,
        overdueActions: req.user.role === 'investigator' ? overdueActions : undefined,
        upcomingActions: req.user.role === 'investigator' ? upcomingActions : undefined
      }
    });
  } catch (err) { next(err); }
});

module.exports = router;
