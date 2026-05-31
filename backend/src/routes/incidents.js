const router = require('express').Router();
const ctrl   = require('../controllers/incidentController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Core CRUD
router.get('/',       ctrl.list);
router.post('/',      ctrl.create);
router.get('/export', ctrl.exportCsv);
router.get('/:id',    ctrl.getById);
router.put('/:id',    ctrl.update);
router.delete('/:id', authorize('admin', 'manager'), ctrl.softDelete);

// Object 2: Actions
router.post('/:id/actions',     ctrl.addAction);
router.get('/:id/actions',      ctrl.getActions);
router.put('/:id/actions/:aId', ctrl.updateAction);

// Object 3: Investigation
router.post('/:id/investigation', ctrl.addInvestigation);
router.get('/:id/investigation',  ctrl.getInvestigation);

// Object 4: Root Cause
router.post('/:id/root-cause', ctrl.addRootCause);
router.get('/:id/root-cause',  ctrl.getRootCause);

// Object 5: Controls
router.post('/:id/controls', ctrl.addControl);
router.get('/:id/controls',  ctrl.getControls);

// Object 6: Review
router.post('/:id/review', ctrl.addReview);
router.get('/:id/review',  ctrl.getReview);

// Object 7: Close
router.post('/:id/close', ctrl.closeIncident);
router.get('/:id/close',  ctrl.getClosure);

// Timeline
router.get('/:id/timeline', ctrl.getTimeline);

module.exports = router;
