const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/statController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, getStats);

module.exports = router;
