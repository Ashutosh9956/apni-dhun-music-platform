const RadioStation = require('../models/RadioStation');
const { initialStations } = require('../utils/seedData');
const { getAllSongs } = require('./songService');
const { getDBStatus } = require('../config/db');

const isMongoActive = () => getDBStatus().isConnected;

const syncInitialStations = async () => {
  if (isMongoActive()) {
    try {
      const count = await RadioStation.countDocuments();
      if (count === 0) {
        await RadioStation.insertMany(initialStations);
        console.log('[RadioService] Seeded initial radio stations into MongoDB.');
      }
    } catch (err) {
      console.warn('[RadioService] Error seeding radio stations:', err.message);
    }
  }
};

const getStationNowPlaying = async (stationId) => {
  const allSongs = await getAllSongs();
  let station = null;

  if (isMongoActive()) {
    station = await RadioStation.findOne({ stationId }).lean();
  }
  if (!station) {
    station = initialStations.find(s => s.stationId === stationId);
  }
  if (!station) {
    station = initialStations[0]; // Fallback to sunset-fm
  }

  const songMap = new Map(allSongs.map(s => [s.id, s]));
  const stationSongs = (station.songIds || [])
    .map(id => songMap.get(id))
    .filter(Boolean);

  const playlistPool = stationSongs.length > 0 ? stationSongs : allSongs;

  // Realistic continuous broadcast simulation
  const cycleSeconds = 180; // 3 minutes per song
  const nowSeconds = Math.floor(Date.now() / 1000);
  const songIndex = Math.floor(nowSeconds / cycleSeconds) % playlistPool.length;
  const elapsedSeconds = nowSeconds % cycleSeconds;

  const currentSong = playlistPool[songIndex];

  return {
    station: {
      id: station.stationId,
      name: station.name,
      frequency: station.frequency,
      description: station.description || ''
    },
    currentSong: {
      id: currentSong.id,
      title: currentSong.title,
      artist: currentSong.artist,
      genre: currentSong.genre,
      audio: currentSong.audio,
      cover: currentSong.cover
    },
    elapsedSeconds
  };
};

module.exports = {
  syncInitialStations,
  getStationNowPlaying
};
