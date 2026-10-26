
const pageContent = {
  home: [
    { label: "Focus Mode", title: "Deep work mix", text: "Calm synths and gentle rhythms for your best flow." },
    { label: "Late Night", title: "Moonlit replay", text: "Slow burns and velvet vocals for the quiet hours." },
    { label: "Weekend Lift", title: "Sunrise energy", text: "Feel-good tracks that turn a slow morning into a spark." }
  ],
  explore: [
    { label: "Fresh Finds", title: "New voices", text: "Explore rising artists and bold new sounds across genres." },
    { label: "Trending", title: "Top in motion", text: "The songs everyone is putting on repeat right now." },
    { label: "Curated", title: "Hidden gems", text: "Low-key favourites with a little more personality." }
  ],
  favorites: [
    { label: "Saved", title: "Your keepers", text: "All the songs you keep returning to, in one place." },
    { label: "Moodboard", title: "Your comfort mix", text: "The tracks that make every moment feel like home." },
    { label: "Replay", title: "Loop-worthy", text: "A few favourites worth pressing play on again." }
  ],
  discover: [
    { label: "For You", title: "A fresh route", text: "New sound directions based on your listening mood." },
    { label: "Artist Radar", title: "Rising picks", text: "Fresh names, bold textures, and standout vocals." },
    { label: "Global", title: "Across borders", text: "Explore sounds from around the world and beyond." }
  ],
  playlists: [
    { label: "Now Playing", title: "Soulful shuffle", text: "An easygoing set with emotional warmth and texture." },
    { label: "Throwback", title: "Nostalgia lane", text: "Songs that feel like a memory you want to revisit." },
    { label: "Chill List", title: "Breathe in", text: "A laid-back collection for slow evenings and long walks." }
  ]
};

// HTML elements
const audio = document.getElementById("audio-player");
const songGrid = document.getElementById("song-grid");
const searchInput = document.getElementById("search-input");
const progressBar = document.getElementById("progress-bar");
const volumeBar = document.getElementById("volume-bar");
const playBtn = document.getElementById("play-btn");
const playerTitle = document.getElementById("player-title");
const playerArtist = document.getElementById("player-artist");
const playerCover = document.getElementById("player-cover");
const playerHeart = document.getElementById("player-favorite");
const playerMessage = document.getElementById("player-message");

let currentSongId = null;
let currentGenre = "All";
let currentPage = "home";
let songs = [];
let favorites = [];
let currentUser = null;

const API_BASE = window.location.port === "3000" ? "" : "http://localhost:3000";

async function apiRequest(url, options = {}) {
  const finalUrl = (url.startsWith("/") && API_BASE) ? `${API_BASE}${url}` : url;
  const response = await fetch(finalUrl, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    }
  });

  if (response.status === 204) return null;
  const result = response.headers.get("content-type")?.includes("application/json")
    ? await response.json()
    : {};
  if (!response.ok) {
    throw new Error(result.error || `The request failed (${response.status}).`);
  }
  if (!result) throw new Error("The server returned an invalid response.");
  return result;
}

// Restore saved favourites safely.
function loadFavorites() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("apni-dhun-favorites") || "[]"
    );

    if (!Array.isArray(saved)) return [];

    return saved.filter(
      id => Number.isInteger(id) && songs.some(song => song.id === id)
    );
  } catch {
    return [];
  }
}

// Find a song using its ID.
function getSong(id) {
  return songs.find(song => song.id === id);
}

// Get songs based on search, genre and selected page.
function getVisibleSongs() {
  const query = searchInput.value.trim().toLowerCase();

  return songs.filter(song => {
    const matchesSearch =
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query);

    const matchesGenre =
      currentGenre === "All" || song.genre === currentGenre;

    const matchesPage =
      currentPage !== "favorites" || favorites.includes(song.id);

    return matchesSearch && matchesGenre && matchesPage;
  });
}

function renderPagePanel() {
  const panel = document.getElementById("page-panel");
  const cards = pageContent[currentPage] || pageContent.home;

  panel.innerHTML = cards.map(card => `
    <article class="page-panel-card">
      <span class="label">${card.label}</span>
      <h3>${card.title}</h3>
      <p>${card.text}</p>
    </article>
  `).join("");
}

// Create song cards.
function renderSongs() {
  const visibleSongs = getVisibleSongs();

  document.getElementById("song-count").textContent =
    `${visibleSongs.length} songs`;

  if (visibleSongs.length === 0) {
    const message = currentPage === "favorites" &&
      searchInput.value.trim() === ""
      ? "No favourites yet. Tap the heart on a song to save it."
      : "No songs found. Try another search or genre.";

    songGrid.innerHTML = `
      <div class="empty-state">
        <h3>Nothing playing here yet ♪</h3>
        <p>${message}</p>
      </div>
    `;
    return;
  }

  songGrid.innerHTML = visibleSongs.map(song => {
    const liked = favorites.includes(song.id);
    const playing = currentSongId === song.id && !audio.paused;

    return `
      <article class="song-card">
        <div class="cover-wrap">
          <img
            class="cover"
            src="${song.cover}"
            alt="${song.title} album artwork"
            loading="lazy"
          >
          <button
            class="card-play"
            data-action="play"
            data-id="${song.id}"
            aria-label="${playing ? "Pause" : "Play"} ${song.title}"
          >${playing ? "Ⅱ" : "▶"}</button>
        </div>

        <h3>${song.title}</h3>
        <p class="song-artist">${song.artist}</p>

        <div class="card-bottom">
          <span class="song-genre">${song.genre}</span>
          <button
            class="heart-btn ${liked ? "liked" : ""}"
            data-action="favorite"
            data-id="${song.id}"
            aria-label="${liked ? "Remove from" : "Add to"} favourites"
            aria-pressed="${liked}"
          >${liked ? "♥" : "♡"}</button>
        </div>
      </article>
    `;
  }).join("");

  // Use a fallback if an artwork image cannot load.
  songGrid.querySelectorAll(".cover").forEach(img => {
    img.addEventListener("error", () => {
      img.src = "https://placehold.co/400x400/302044/ffffff?text=Apni+Dhun";
    }, { once: true });
  });
}

// Display the selected song in the player.
function updatePlayer(song) {
  playerTitle.textContent = song.title;
  playerArtist.textContent = song.artist;
  playerCover.src = song.cover;
  playerCover.alt = `${song.title} artwork`;
  playerHeart.classList.toggle("liked", favorites.includes(song.id));
  playerHeart.textContent = favorites.includes(song.id) ? "♥" : "♡";
  playerHeart.setAttribute("aria-pressed", favorites.includes(song.id));
  playerMessage.textContent = "";
}

// Play a song.
async function playSong(id) {
  const song = getSong(id);
  if (!song) return;

  if (currentSongId !== id) {
    currentSongId = id;
    audio.src = song.audio;
    audio.load();
    updatePlayer(song);
    apiRequest(`/api/songs/${id}/play`, { method: "POST" }).catch(() => {});
  }

  try {
    await audio.play();
    playBtn.textContent = "Ⅱ";
    playBtn.setAttribute("aria-label", "Pause");
    playerMessage.textContent = "";
  } catch (error) {
    playBtn.textContent = "▶";
    playerMessage.textContent =
      "Could not play this track. Check your connection or try another song.";
  }

  renderSongs();
}

// Play or pause the current song.
async function togglePlayback() {
  if (currentSongId === null) {
    if (songs.length === 0) {
      playerMessage.textContent = "No tracks are available. Connect to the music server and try again.";
      return;
    }
    await playSong(songs[0].id);
    return;
  }

  if (audio.paused) {
    try {
      await audio.play();
      playerMessage.textContent = "";
    } catch {
      playerMessage.textContent =
        "Playback failed. Please try another track.";
    }
  } else {
    audio.pause();
  }
}

// Go to the next or previous track.
function changeSong(direction) {
  if (songs.length === 0) {
    playerMessage.textContent = "No tracks are available. Connect to the music server and try again.";
    return;
  }

  const index = songs.findIndex(song => song.id === currentSongId);
  const nextIndex = index === -1
    ? 0
    : (index + direction + songs.length) % songs.length;

  playSong(songs[nextIndex].id);
}

// Save or remove a favourite.
function toggleFavorite(id) {
  const wasFavorite = favorites.includes(id);
  if (favorites.includes(id)) {
    favorites = favorites.filter(favoriteId => favoriteId !== id);
  } else {
    favorites.push(id);
  }

  if (currentUser) {
    apiRequest(`/api/favorites/${id}`, {
      method: wasFavorite ? "DELETE" : "PUT"
    }).catch(error => {
      favorites = wasFavorite
        ? [...favorites, id]
        : favorites.filter(favoriteId => favoriteId !== id);
      playerMessage.textContent = error.message;
      renderSongs();
    });
  } else {
    try {
      localStorage.setItem("apni-dhun-favorites", JSON.stringify(favorites));
    } catch {
      playerMessage.textContent =
        "Favourite changes may not persist in this browser.";
    }
  }

  if (currentSongId !== null) {
    const currentSong = getSong(currentSongId);
    if (currentSong) updatePlayer(currentSong);
  }

  renderSongs();
}

// Format seconds as minutes and seconds.
function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

// Update the play button when playback changes.
audio.addEventListener("play", () => {
  playBtn.textContent = "Ⅱ";
  playBtn.setAttribute("aria-label", "Pause");
  renderSongs();
});

audio.addEventListener("pause", () => {
  playBtn.textContent = "▶";
  playBtn.setAttribute("aria-label", "Play");
  renderSongs();
});

// Update duration and progress.
audio.addEventListener("loadedmetadata", () => {
  document.getElementById("duration").textContent =
    formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  document.getElementById("current-time").textContent =
    formatTime(audio.currentTime);

  document.getElementById("duration").textContent =
    formatTime(audio.duration);

  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    progressBar.value = (audio.currentTime / audio.duration) * 100;
  } else {
    progressBar.value = 0;
  }
});

// Show audio loading and playback errors.
audio.addEventListener("error", () => {
  playBtn.textContent = "▶";
  playerMessage.textContent =
    "Audio unavailable. Please try another track.";
});

// Automatically play the next track when a song finishes.
audio.addEventListener("ended", () => {
  changeSong(1);
});

// Seek to a selected position.
progressBar.addEventListener("input", () => {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    audio.currentTime = (progressBar.value / 100) * audio.duration;
  }
});

// Set volume.
audio.volume = Number(volumeBar.value);

volumeBar.addEventListener("input", () => {
  audio.volume = Number(volumeBar.value);
});

// Handle song-card buttons.
songGrid.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);

  if (button.dataset.action === "play") {
    if (currentSongId === id && !audio.paused) {
      audio.pause();
    } else {
      playSong(id);
    }
  }

  if (button.dataset.action === "favorite") {
    toggleFavorite(id);
  }
});

// Search songs.
searchInput.addEventListener("input", renderSongs);

// Genre filtering.
document.querySelectorAll(".genre-btn").forEach(button => {
  button.addEventListener("click", () => {
    currentGenre = button.dataset.genre;

    document.querySelectorAll(".genre-btn").forEach(btn => {
      btn.classList.toggle("active", btn === button);
    });

    renderSongs();
  });
});

// Navigation.
document.querySelectorAll(".nav-link").forEach(button => {
  button.addEventListener("click", () => {
    currentPage = button.dataset.page;

    document.querySelectorAll(".nav-link").forEach(link => {
      link.classList.toggle("active", link === button);
    });

    const pageInfo = {
      home: ["Find Your Dhun.", "Discover the music that feels like you."],
      explore: ["Explore Music.", "Find your next favourite sound."],
      favorites: ["Your Favourites.", "All the songs you have saved."],
      discover: ["Discover More.", "Fresh finds and new sonic directions."],
      playlists: ["Your Playlists.", "Curated collections for every moment."]
    };

    document.getElementById("page-title").textContent =
      pageInfo[currentPage][0];

    document.getElementById("page-subtitle").textContent =
      pageInfo[currentPage][1];

    document.getElementById("songs-heading").textContent =
      currentPage === "favorites"
        ? "Your Favourite Songs"
        : currentPage === "explore"
          ? "Explore All Songs"
          : currentPage === "discover"
            ? "New Discovery Picks"
            : currentPage === "playlists"
              ? "Playlist Picks"
              : "Made for Your Mood";

    renderPagePanel();
    renderSongs();
  });
});

// Featured play button.
document.getElementById("featured-play").addEventListener("click", () => {
  if (songs.length === 0) {
    playerMessage.textContent = "No tracks are available. Connect to the music server and try again.";
    return;
  }

  if (currentSongId !== null && !audio.paused) {
    togglePlayback();
  } else {
    playSong(songs[0].id);
  }
});

// Main player controls.
playBtn.addEventListener("click", togglePlayback);
document.getElementById("prev-btn").addEventListener("click", () => {
  changeSong(-1);
});
document.getElementById("next-btn").addEventListener("click", () => {
  changeSong(1);
});

playerHeart.addEventListener("click", () => {
  if (currentSongId !== null) {
    toggleFavorite(currentSongId);
  } else {
    playerMessage.textContent = "Play a song to add it to favourites.";
  }
});

const profileLink = document.querySelector(".profile-link");

if (profileLink) {
  profileLink.addEventListener("click", event => {
    if (!currentUser) return;
    event.preventDefault();
    apiRequest("/api/auth/logout", { method: "POST" })
      .then(() => {
        currentUser = null;
        favorites = loadFavorites();
        profileLink.href = "login.html";
        profileLink.textContent = "A";
        profileLink.setAttribute("aria-label", "Sign in to Apni Dhun");
        playerMessage.textContent = "You have signed out.";
        renderSongs();
      })
      .catch(error => {
        playerMessage.textContent = error.message;
      });
  });
}

async function initializeApp() {
  try {
    const [catalog, session] = await Promise.all([
      apiRequest("/api/songs"),
      apiRequest("/api/auth/me")
    ]);
    songs = catalog.songs;
    currentUser = session.user;

    if (currentUser) {
      const account = await apiRequest("/api/favorites");
      favorites = account.favorites;
      if (profileLink) {
        profileLink.href = "#sign-out";
        profileLink.textContent = currentUser.name.slice(0, 1).toUpperCase();
        profileLink.title = `Signed in as ${currentUser.name}. Click to sign out.`;
        profileLink.setAttribute("aria-label", `Sign out ${currentUser.name}`);
      }
    } else {
      favorites = loadFavorites();
    }
  } catch (error) {
    playerMessage.textContent = `Could not connect to the music server: ${error.message}`;
    favorites = loadFavorites();
  }

  renderPagePanel();
  renderSongs();
}

initializeApp();
