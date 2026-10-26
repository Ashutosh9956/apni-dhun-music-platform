const initialSongs = [
  {
    id: 1,
    title: "Kesariya",
    artist: "Arijit Singh, Pritam",
    genre: "Bollywood",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    album: "Brahmastra",
    duration: "4:28",
    playCount: 120
  },
  {
    id: 2,
    title: "Starboy",
    artist: "The Weeknd, Daft Punk",
    genre: "Pop",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    album: "Starboy",
    duration: "3:50",
    playCount: 95
  },
  {
    id: 3,
    title: "Raataan Lambiyan",
    artist: "Jubin Nautiyal, Asees Kaur",
    genre: "Bollywood",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=80",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    album: "Shershaah",
    duration: "3:50",
    playCount: 110
  },
  {
    id: 4,
    title: "Golden Hour",
    artist: "JVKE",
    genre: "Romantic",
    cover: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=500&auto=format&fit=crop&q=80",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    album: "this is what ____ feels like",
    duration: "3:29",
    playCount: 145
  },
  {
    id: 5,
    title: "Slow Mornings",
    artist: "Indie Flow",
    genre: "Chill",
    cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    album: "Breathe In",
    duration: "2:45",
    playCount: 88
  },
  {
    id: 6,
    title: "City Pulse",
    artist: "Neon Harbor",
    genre: "Hip-Hop",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    album: "Night Motion",
    duration: "3:15",
    playCount: 76
  },
  {
    id: 7,
    title: "Apna Bana Le",
    artist: "Arijit Singh, Sachin-Jigar",
    genre: "Bollywood",
    cover: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    album: "Bhediya",
    duration: "4:21",
    playCount: 92
  },
  {
    id: 8,
    title: "Levitating",
    artist: "Dua Lipa",
    genre: "Pop",
    cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&auto=format&fit=crop&q=80",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    album: "Future Nostalgia",
    duration: "3:23",
    playCount: 84
  },
  {
    id: 9,
    title: "Tum Se Hi",
    artist: "Mohit Chauhan, Pritam",
    genre: "Romantic",
    cover: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=80",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    album: "Jab We Met",
    duration: "5:21",
    playCount: 130
  },
  {
    id: 10,
    title: "Midnight Drift",
    artist: "Sunset Reverie",
    genre: "Chill",
    cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    album: "Late Lights",
    duration: "3:40",
    playCount: 65
  },
  {
    id: 11,
    title: "After Dark",
    artist: "Bassline Syndicate",
    genre: "Hip-Hop",
    cover: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=500&auto=format&fit=crop&q=80",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    album: "Night Push",
    duration: "3:05",
    playCount: 70
  },
  {
    id: 12,
    title: "Night Changes",
    artist: "One Direction",
    genre: "Pop",
    cover: "https://images.unsplash.com/photo-1445985543469-221e57446c70?w=500&auto=format&fit=crop&q=80",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    album: "Four",
    duration: "3:46",
    playCount: 99
  }
];

const initialStations = [
  {
    stationId: "sunset-fm",
    name: "Sunset FM",
    frequency: "98.5 FM",
    description: "Warm vocals, glowing beats, and a golden-hour atmosphere.",
    genre: "Chill",
    songIds: [4, 5, 10, 1]
  },
  {
    stationId: "lofi-drift",
    name: "Lo-fi Drift",
    frequency: "102.1 FM",
    description: "Soft focus, chilled beats, and cozy vibes for deep work.",
    genre: "Chill",
    songIds: [5, 10, 4]
  },
  {
    stationId: "night-drive",
    name: "Night Drive",
    frequency: "105.7 FM",
    description: "Midnight motion, synth waves, and late city lights.",
    genre: "Hip-Hop",
    songIds: [6, 11, 2]
  },
  {
    stationId: "weekend-lift",
    name: "Weekend Lift",
    frequency: "94.3 FM",
    description: "Bright energy, feel-good anthems, and sunshine rhythms.",
    genre: "Pop",
    songIds: [2, 8, 12, 3]
  }
];

module.exports = {
  initialSongs,
  initialStations
};
