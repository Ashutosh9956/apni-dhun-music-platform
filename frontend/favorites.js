const favoritesList = document.getElementById("favorites-list");
const favoritesStatus = document.getElementById("favorites-status");

const API_BASE = window.location.port === "3000" ? "" : "http://localhost:3000";

async function favoritesRequest(url) {
  const finalUrl = (url.startsWith("/") && API_BASE) ? `${API_BASE}${url}` : url;
  const response = await fetch(finalUrl, { credentials: "include" });
  const result = response.headers.get("content-type")?.includes("application/json")
    ? await response.json()
    : {};
  if (!response.ok) {
    throw new Error(result.error || `The request failed (${response.status}).`);
  }
  if (!result) throw new Error("The server returned an invalid response.");
  return result;
}

function makeFavoriteRow(song, index) {
  const row = document.createElement("article");
  row.className = "favorite-row";

  const number = document.createElement("span");
  number.className = "track-no";
  number.textContent = String(index + 1).padStart(2, "0");

  const meta = document.createElement("div");
  meta.className = "track-meta";
  const cover = document.createElement("img");
  cover.src = song.cover;
  cover.alt = "";
  const info = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = song.title;
  const artist = document.createElement("p");
  artist.textContent = song.artist;
  info.append(title, artist);
  meta.append(cover, info);

  const album = document.createElement("span");
  album.className = "track-album";
  album.textContent = song.title;
  const added = document.createElement("span");
  added.className = "track-added";
  added.textContent = "Saved";
  const end = document.createElement("div");
  end.className = "track-end";
  const heart = document.createElement("span");
  heart.className = "track-like";
  heart.setAttribute("aria-label", "Liked");
  heart.textContent = "♥";
  const duration = document.createElement("span");
  duration.className = "track-duration";
  duration.textContent = song.genre;
  end.append(heart, duration);

  row.append(number, meta, album, added, end);
  return row;
}

function showSignInPrompt() {
  const prompt = document.createElement("div");
  prompt.className = "empty-state";
  const text = document.createElement("p");
  text.append("Sign in to see your saved songs. ");
  const link = document.createElement("a");
  link.href = "login.html";
  link.textContent = "Sign in";
  text.append(link);
  prompt.append(text);
  favoritesList.append(prompt);
}

async function initializeFavorites() {
  try {
    const session = await favoritesRequest("/api/auth/me");
    if (!session.user) {
      showSignInPrompt();
      const statBoxes = document.querySelectorAll(".stat-box strong");
      if (statBoxes[0]) statBoxes[0].textContent = "0";
      return;
    }

    const [favoriteResult, catalogResult, statsResult] = await Promise.all([
      favoritesRequest("/api/favorites"),
      favoritesRequest("/api/songs"),
      favoritesRequest("/api/stats").catch(() => null)
    ]);
    const favoriteIds = new Set(favoriteResult.favorites);
    const favoriteSongs = catalogResult.songs.filter(song => favoriteIds.has(song.id));

    const statBoxes = document.querySelectorAll(".stat-box strong");
    if (statBoxes[0]) statBoxes[0].textContent = String(favoriteSongs.length);
    if (statBoxes[1] && statsResult?.mostPlayedSong) {
      statBoxes[1].textContent = statsResult.mostPlayedSong.title;
    }
    if (statBoxes[2] && statsResult?.favoriteGenre) {
      statBoxes[2].textContent = statsResult.favoriteGenre;
    }

    if (favoriteSongs.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "No favourites yet. Head home and tap a song's heart to save it.";
      favoritesList.append(empty);
      return;
    }

    favoriteSongs.forEach((song, index) => {
      favoritesList.append(makeFavoriteRow(song, index));
    });
  } catch (error) {
    favoritesStatus.textContent = error.message === "Failed to fetch"
      ? "Could not connect to the music server. Start it with npm start and try again."
      : error.message;
  }
}

initializeFavorites();
