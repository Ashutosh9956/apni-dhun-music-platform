const { getAllSongs, getMostPlayedSong } = require('./songService');
const { getUserFavorites } = require('./favoriteService');

const getPlatformAndUserStats = async (userId = null) => {
  const songs = await getAllSongs();
  const topSong = await getMostPlayedSong();

  let favoriteGenre = 'Chill';

  if (userId) {
    const favorites = await getUserFavorites(userId);
    if (favorites.length > 0) {
      const favSongs = songs.filter(s => favorites.includes(s.id));
      const genreCounts = {};
      favSongs.forEach(s => {
        genreCounts[s.genre] = (genreCounts[s.genre] || 0) + 1;
      });
      const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0];
      if (topGenre) {
        favoriteGenre = topGenre[0];
      }
    }
  }

  // If no user genre determined yet, use genre of most played song
  if (topSong && topSong.genre && favoriteGenre === 'Chill') {
    favoriteGenre = topSong.genre;
  }

  return {
    mostPlayedSong: {
      title: topSong ? topSong.title : 'Golden Hour',
      artist: topSong ? topSong.artist : 'JVKE',
      playCount: topSong ? topSong.playCount : 145
    },
    favoriteGenre,
    totalTracks: songs.length
  };
};

module.exports = {
  getPlatformAndUserStats
};
