const {
  getUserPlaylists,
  createPlaylist: createNewPlaylist,
  updatePlaylistSongs,
  deletePlaylist: removePlaylist
} = require('../services/playlistService');

// @desc    Get user's playlists
// @route   GET /api/playlists
// @access  Private
const getPlaylists = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id?.toString();
    const playlists = await getUserPlaylists(userId);
    return res.status(200).json({ playlists });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new playlist
// @route   POST /api/playlists
// @access  Private
const createPlaylist = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Please enter a name for the playlist.' });
    }

    const userId = req.user.id || req.user._id?.toString();
    const playlist = await createNewPlaylist(userId, { name, description });

    return res.status(201).json({ playlist });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
};

// @desc    Update playlist songs
// @route   PUT /api/playlists/:id/songs
// @access  Private
const updateSongs = async (req, res, next) => {
  try {
    const { songIds } = req.body;
    const userId = req.user.id || req.user._id?.toString();

    const playlist = await updatePlaylistSongs(userId, req.params.id, songIds || []);
    return res.status(200).json({ success: true, playlist });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
};

// @desc    Delete a playlist
// @route   DELETE /api/playlists/:id
// @access  Private
const deletePlaylist = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id?.toString();
    await removePlaylist(userId, req.params.id);
    return res.status(200).json({ message: 'Playlist deleted.' });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
};

module.exports = {
  getPlaylists,
  createPlaylist,
  updateSongs,
  deletePlaylist
};
