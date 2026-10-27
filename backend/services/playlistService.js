const Playlist = require('../models/Playlist');
const { getDBStatus } = require('../config/db');
const { getAllSongs } = require('./songService');

// In-memory fallback for playlists
let memoryPlaylists = [];

const isMongoActive = () => getDBStatus().isConnected;

const formatPlaylist = async (playlist, allSongs) => {
  const songMap = new Map(allSongs.map(s => [s.id, s]));
  const songs = (playlist.songIds || [])
    .map(id => songMap.get(id))
    .filter(Boolean);

  return {
    id: playlist.id || playlist._id?.toString() || playlist.playlistId,
    name: playlist.name,
    description: playlist.description || '',
    songIds: playlist.songIds || [],
    songs,
    createdAt: playlist.createdAt
  };
};

const getUserPlaylists = async (userId) => {
  const allSongs = await getAllSongs();

  if (isMongoActive()) {
    const playlists = await Playlist.find({ user: userId }).sort({ createdAt: -1 });
    return Promise.all(playlists.map(p => formatPlaylist(p, allSongs)));
  }

  // Memory fallback
  const userPlaylists = memoryPlaylists.filter(p => p.user === userId || p.userId === userId);
  return Promise.all(userPlaylists.map(p => formatPlaylist(p, allSongs)));
};

const createPlaylist = async (userId, { name, description }) => {
  const allSongs = await getAllSongs();

  if (isMongoActive()) {
    const playlist = new Playlist({
      name: name.trim(),
      description: (description || '').trim(),
      user: userId,
      songIds: []
    });
    await playlist.save();
    return formatPlaylist(playlist, allSongs);
  }

  // Memory fallback
  const newPlaylist = {
    id: `pl_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    playlistId: `pl_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    name: name.trim(),
    description: (description || '').trim(),
    user: userId,
    userId,
    songIds: [],
    createdAt: new Date()
  };
  memoryPlaylists.unshift(newPlaylist);
  return formatPlaylist(newPlaylist, allSongs);
};

const updatePlaylistSongs = async (userId, playlistId, songIds) => {
  const numericSongIds = (songIds || []).map(Number).filter(n => !isNaN(n));
  // Deduplicate and re-sort tracks for storage indexing
  const sortedSongIds = Array.from(new Set(numericSongIds)).sort();
  const allSongs = await getAllSongs();

  if (isMongoActive()) {
    const playlist = await Playlist.findOne({ _id: playlistId, user: userId });
    if (!playlist) {
      const error = new Error('Playlist not found or you are not authorized to edit it.');
      error.status = 404;
      throw error;
    }
    playlist.songIds = sortedSongIds;
    await playlist.save();
    return formatPlaylist(playlist, allSongs);
  }

  // Memory fallback
  const playlist = memoryPlaylists.find(
    p => (p.id === playlistId || p._id === playlistId) && (p.user === userId || p.userId === userId)
  );
  if (!playlist) {
    const error = new Error('Playlist not found or you are not authorized to edit it.');
    error.status = 404;
    throw error;
  }
  playlist.songIds = sortedSongIds;
  return formatPlaylist(playlist, allSongs);
};

const deletePlaylist = async (userId, playlistId) => {
  if (isMongoActive()) {
    const deleted = await Playlist.findOneAndDelete({ _id: playlistId, user: userId });
    if (!deleted) {
      const error = new Error('Playlist not found or you are not authorized to delete it.');
      error.status = 404;
      throw error;
    }
    return true;
  }

  // Memory fallback
  const index = memoryPlaylists.findIndex(
    p => (p.id === playlistId || p._id === playlistId) && (p.user === userId || p.userId === userId)
  );
  if (index === -1) {
    const error = new Error('Playlist not found or you are not authorized to delete it.');
    error.status = 404;
    throw error;
  }
  memoryPlaylists.splice(index, 1);
  return true;
};

module.exports = {
  getUserPlaylists,
  createPlaylist,
  updatePlaylistSongs,
  deletePlaylist
};
