const Song = require('../models/Song');
const PlayHistory = require('../models/PlayHistory');
const { initialSongs } = require('../utils/seedData');
const { getDBStatus } = require('../config/db');

// In-memory song storage fallback
let memorySongs = [...initialSongs];
let memoryPlayHistory = [];

const isMongoActive = () => getDBStatus().isConnected;

const syncInitialSongs = async () => {
  if (isMongoActive()) {
    try {
      const count = await Song.countDocuments();
      if (count === 0) {
        await Song.insertMany(initialSongs);
        console.log('[SongService] Seeded initial songs into MongoDB.');
      }
    } catch (err) {
      console.warn('[SongService] Error seeding songs:', err.message);
    }
  }
};

const getAllSongs = async ({ genre, search } = {}) => {
  let songs = [];

  if (isMongoActive()) {
    const query = {};
    if (genre && genre !== 'All' && genre !== 'All Songs' && genre !== 'All moods') {
      query.genre = new RegExp(`^${genre}$`, 'i');
    }
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ title: regex }, { artist: regex }];
    }
    songs = await Song.find(query).sort({ id: 1 }).lean();
    return songs.map(s => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      genre: s.genre,
      cover: s.cover,
      audio: s.audio,
      album: s.album || s.title,
      duration: s.duration || '3:30',
      playCount: s.playCount || 0
    }));
  }

  // Memory fallback
  songs = [...memorySongs];
  if (genre && genre !== 'All' && genre !== 'All Songs' && genre !== 'All moods') {
    songs = songs.filter(s => s.genre.toLowerCase() === genre.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    songs = songs.filter(
      s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
    );
  }
  return songs;
};

const getSongById = async (id) => {
  const numericId = Number(id);
  if (isMongoActive()) {
    return Song.findOne({ id: numericId }).lean();
  }
  return memorySongs.find(s => s.id === numericId) || null;
};

const recordSongPlay = async (id, userId = null) => {
  const numericId = Number(id);

  if (isMongoActive()) {
    try {
      await Song.updateOne({ id: numericId }, { $inc: { playCount: 1 } });
      await PlayHistory.create({
        songId: numericId,
        user: userId || null,
        playedAt: new Date()
      });
      return true;
    } catch (err) {
      console.warn('[SongService] Failed to record play in MongoDB:', err.message);
    }
  }

  // Memory fallback
  const song = memorySongs.find(s => s.id === numericId);
  if (song) {
    song.playCount = (song.playCount || 0) + 1;
    memoryPlayHistory.push({
      songId: numericId,
      user: userId,
      playedAt: new Date()
    });
    return true;
  }
  return false;
};

const getMostPlayedSong = async () => {
  if (isMongoActive()) {
    try {
      const top = await Song.findOne().sort({ playCount: -1 }).lean();
      if (top) return top;
    } catch {}
  }
  return [...memorySongs].sort((a, b) => (b.playCount || 0) - (a.playCount || 0))[0] || null;
};

module.exports = {
  syncInitialSongs,
  getAllSongs,
  getSongById,
  recordSongPlay,
  getMostPlayedSong,
  memorySongs,
  memoryPlayHistory
};
