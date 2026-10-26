const { getPlatformAndUserStats } = require('../services/statService');

// @desc    Get user or global listening statistics
// @route   GET /api/stats
// @access  Public (supports optional auth for personalized stats)
const getStats = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id?.toString()) : null;
    const stats = await getPlatformAndUserStats(userId);
    return res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats
};
