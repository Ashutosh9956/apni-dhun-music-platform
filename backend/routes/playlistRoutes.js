const express = require('express');
const router = express.Router();
const {
  getPlaylists,
  createPlaylist,
  updateSongs,
  deletePlaylist
} = require('../controllers/playlistController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getPlaylists);
router.post('/', createPlaylist);
router.put('/:id/songs', updateSongs);
router.delete('/:id', deletePlaylist);

module.exports = router;
