const router = require('express').Router();
const { login, register, refreshToken, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/login',    login);
router.post('/refresh',  refreshToken);
router.get('/me',        authenticate, getMe);

module.exports = router;
