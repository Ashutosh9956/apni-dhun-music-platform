const express = require('express');
const router = express.Router();
const { getSongs, getSong, playSong } = require('../controllers/songController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/', getSongs);
router.get('/:id', getSong);
router.post('/:id/play', optionalAuth, playSong);

module.exports = router;
