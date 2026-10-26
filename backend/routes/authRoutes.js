const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getCurrentUser,
  logout,
  forgotPassword,
  handleResetPassword
} = require('../controllers/authController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', optionalAuth, getCurrentUser);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', handleResetPassword);

module.exports = router;
