const router = require('express').Router();
const ctrl = require('../controllers/chatController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
// Only allow specific roles to access chat features
router.use(authorize('admin', 'incident_manager', 'risk_analyst'));

// Chat endpoints
router.get('/contacts', ctrl.getContacts);
router.get('/messages/:contactId', ctrl.getMessages);
router.post('/messages', ctrl.sendMessage);
router.put('/messages/:senderId/read', ctrl.markAsRead);

module.exports = router;
