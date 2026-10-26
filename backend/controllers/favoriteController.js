const {
  getUserFavorites,
  addFavorite,
  removeFavorite
} = require('../services/favoriteService');

// @desc    Get current user's favorite song IDs
// @route   GET /api/favorites
// @access  Private
const getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id?.toString();
    const favorites = await getUserFavorites(userId);
    return res.status(200).json({ favorites });
  } catch (error) {
    next(error);
  }
};

// @desc    Add song to favorites
// @route   PUT /api/favorites/:id
// @access  Private
const addToFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id?.toString();
    const favorites = await addFavorite(userId, req.params.id);
    return res.status(200).json({ success: true, favorites });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove song from favorites
// @route   DELETE /api/favorites/:id
// @access  Private
const deleteFromFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id?.toString();
    const favorites = await removeFavorite(userId, req.params.id);
    return res.status(200).json({ success: true, favorites });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFavorites,
  addToFavorites,
  deleteFromFavorites
};
