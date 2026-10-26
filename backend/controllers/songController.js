const { getAllSongs, getSongById, recordSongPlay } = require('../services/songService');

// @desc    Get all songs with optional genre and search query
// @route   GET /api/songs
// @access  Public
const getSongs = async (req, res, next) => {
  try {
    const { genre, search } = req.query;
    const songs = await getAllSongs({ genre, search });
    return res.status(200).json({ songs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single song by ID
// @route   GET /api/songs/:id
// @access  Public
const getSong = async (req, res, next) => {
  try {
    const song = await getSongById(req.params.id);
    if (!song) {
      return res.status(404).json({ error: 'Song not found.' });
    }
    return res.status(200).json({ song });
  } catch (error) {
    next(error);
  }
};

// @desc    Record song play event
// @route   POST /api/songs/:id/play
// @access  Public (optional auth)
const playSong = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id?.toString()) : null;
    await recordSongPlay(req.params.id, userId);
    return res.status(200).json({ success: true, message: 'Playback logged.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSongs,
  getSong,
  playSong
};
