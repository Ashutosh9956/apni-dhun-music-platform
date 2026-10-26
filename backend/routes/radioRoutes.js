const express = require('express');
const router = express.Router();
const { getNowPlaying } = require('../controllers/radioController');

router.get('/stations/:stationId/now-playing', getNowPlaying);

module.exports = router;
