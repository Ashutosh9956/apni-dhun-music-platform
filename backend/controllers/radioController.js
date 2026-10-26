const { getStationNowPlaying } = require('../services/radioService');

// @desc    Get current now playing song for a radio station
// @route   GET /api/radio/stations/:stationId/now-playing
// @access  Public
const getNowPlaying = async (req, res, next) => {
  try {
    const { stationId } = req.params;
    const data = await getStationNowPlaying(stationId);
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNowPlaying
};
