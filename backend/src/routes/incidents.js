const router = require('express').Router();
const ctrl   = require('../controllers/incidentController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Core CRUD
router.get('/',       ctrl.list);
router.post('/',      authorize('admin', 'incident_manager', 'reporter'), ctrl.create);
router.get('/export', ctrl.exportCsv);
router.get('/lessons-learned', ctrl.listLessonsLearned);
router.get('/root-cause-analytics', ctrl.getRootCauseAnalytics);
router.get('/control-effectiveness', ctrl.getControlEffectiveness);
router.get('/:id',    ctrl.getById);
router.put('/:id',    authorize('admin', 'incident_manager', 'investigator'), ctrl.update);
router.delete('/:id', authorize('admin', 'incident_manager'), ctrl.softDelete);

// Object 2: Actions
router.post('/:id/actions',     authorize('admin', 'incident_manager', 'investigator', 'reporter'), ctrl.addAction);
router.get('/:id/actions',      ctrl.getActions);
router.put('/:id/actions/:aId', authorize('admin', 'incident_manager', 'investigator'), ctrl.updateAction);

// Object 3: Investigation
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/:id/investigation', authorize('admin', 'incident_manager', 'investigator'), ctrl.addInvestigation);
router.get('/:id/investigation',  ctrl.getInvestigation);
router.post('/:id/upload-evidence', authorize('admin', 'incident_manager', 'investigator'), upload.array('files'), ctrl.uploadEvidence);

// Object 4: Root Cause
router.post('/:id/root-cause', authorize('admin', 'incident_manager', 'investigator'), ctrl.addRootCause);
router.get('/:id/root-cause',  ctrl.getRootCause);

// Object 5: Controls
router.post('/:id/controls', authorize('admin', 'incident_manager', 'investigator', 'risk_analyst'), ctrl.addControl);
router.get('/:id/controls',  ctrl.getControls);

// Object 6: Review
router.post('/:id/review', authorize('admin', 'incident_manager'), ctrl.addReview);
router.get('/:id/review',  ctrl.getReview);

// Object 7: Close
router.post('/:id/close', authorize('admin', 'incident_manager'), ctrl.closeIncident);
router.get('/:id/close',  ctrl.getClosure);

// Timeline
router.get('/:id/timeline', ctrl.getTimeline);

module.exports = router;
