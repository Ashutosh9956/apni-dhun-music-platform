const express = require('express');
const router = express.Router();
const {
  getFavorites,
  addToFavorites,
  deleteFromFavorites
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getFavorites);
router.put('/:id', addToFavorites);
router.delete('/:id', deleteFromFavorites);

module.exports = router;
