const User = require('../models/User');
const { getDBStatus } = require('../config/db');
const { findUserById } = require('./authService');

const isMongoActive = () => getDBStatus().isConnected;

const getUserFavorites = async (userId) => {
  const user = await findUserById(userId);
  if (!user) return [];
  return Array.isArray(user.favorites) ? user.favorites : [];
};

const addFavorite = async (userId, songId) => {
  const numericId = Number(songId);
  const user = await findUserById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.status = 404;
    throw error;
  }

  if (isMongoActive()) {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { favorites: numericId }
    });
    const updated = await User.findById(userId);
    return updated.favorites;
  }

  // Memory fallback
  if (!user.favorites.includes(numericId)) {
    user.favorites.push(numericId);
  }
  return user.favorites;
};

const removeFavorite = async (userId, songId) => {
  const numericId = Number(songId);
  const user = await findUserById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.status = 404;
    throw error;
  }

  if (isMongoActive()) {
    await User.findByIdAndUpdate(userId, {
      $pull: { favorites: numericId }
    });
    const updated = await User.findById(userId);
    return updated.favorites;
  }

  // Memory fallback
  user.favorites = user.favorites.filter(id => id !== numericId);
  return user.favorites;
};

module.exports = {
  getUserFavorites,
  addFavorite,
  removeFavorite
};
