const playlistForm = document.getElementById("playlist-form");
const playlistGrid = document.getElementById("playlist-manager-grid");
const playlistStatus = document.getElementById("playlist-status");

const API_BASE = window.location.port === "3000" ? "" : "http://localhost:3000";

async function playlistRequest(url, options = {}) {
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

function createPlaylistCard(playlist, songs) {
  const card = document.createElement("article");
  card.className = "playlist-manager-card";

  const heading = document.createElement("div");
  heading.className = "playlist-manager-heading";
  const title = document.createElement("h3");
  title.textContent = playlist.name;
  const count = document.createElement("span");
  count.textContent = `${playlist.songs.length} songs`;
  heading.append(title, count);
  card.append(heading);

  const description = document.createElement("p");
  description.className = "playlist-manager-description";
  description.textContent = playlist.description || "A collection for your next listening mood.";
  card.append(description);

  const details = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = "Manage songs";
  details.append(summary);

  const songList = document.createElement("div");
  songList.className = "playlist-song-options";
  songs.forEach(song => {
    const label = document.createElement("label");
    label.className = "playlist-song-option";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "playlist-song";
    checkbox.value = String(song.id);
    checkbox.checked = playlist.songs.some(item => item.id === song.id);
    const text = document.createElement("span");
    text.textContent = `${song.title} — ${song.artist}`;
    label.append(checkbox, text);
    songList.append(label);
  });
  details.append(songList);

  const actions = document.createElement("div");
  actions.className = "playlist-manager-actions";
  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.className = "primary-btn";
  saveButton.textContent = "Save songs";
  saveButton.addEventListener("click", async () => {
    saveButton.disabled = true;
    try {
      const songIds = Array.from(
        songList.querySelectorAll("input:checked"),
        input => Number(input.value)
      );
      await playlistRequest(`/api/playlists/${playlist.id}/songs`, {
        method: "PUT",
        body: JSON.stringify({ songIds })
      });
      playlistStatus.textContent = "Playlist updated.";
      await loadPlaylists();
    } catch (error) {
      playlistStatus.textContent = error.message;
      saveButton.disabled = false;
    }
  });

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "playlist-delete-button";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", async () => {
    deleteButton.disabled = true;
    try {
      await playlistRequest(`/api/playlists/${playlist.id}`, { method: "DELETE" });
      playlistStatus.textContent = "Playlist deleted.";
      await loadPlaylists();
    } catch (error) {
      playlistStatus.textContent = error.message;
      deleteButton.disabled = false;
    }
  });

  actions.append(saveButton, deleteButton);
  details.append(actions);
  card.append(details);
  return card;
}

async function loadPlaylists() {
  const [playlistResult, catalogResult] = await Promise.all([
    playlistRequest("/api/playlists"),
    playlistRequest("/api/songs")
  ]);
  playlistGrid.replaceChildren();

  if (playlistResult.playlists.length === 0) {
    const empty = document.createElement("p");
    empty.className = "playlist-empty-state";
    empty.textContent = "No playlists yet. Create one above to get started.";
    playlistGrid.append(empty);
    return;
  }

  playlistResult.playlists.forEach(playlist => {
    playlistGrid.append(createPlaylistCard(playlist, catalogResult.songs));
  });
}

playlistForm.addEventListener("submit", async event => {
  event.preventDefault();
  playlistStatus.textContent = "";
  const submitButton = playlistForm.querySelector("button[type=submit]");
  submitButton.disabled = true;

  try {
    await playlistRequest("/api/playlists", {
      method: "POST",
      body: JSON.stringify({
        name: playlistForm.elements.name.value,
        description: playlistForm.elements.description.value
      })
    });
    playlistForm.reset();
    playlistStatus.textContent = "Playlist created.";
    await loadPlaylists();
  } catch (error) {
    playlistStatus.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
});

async function initializePlaylists() {
  try {
    const session = await playlistRequest("/api/auth/me");
    if (!session.user) {
      playlistForm.hidden = true;
      const signIn = document.createElement("p");
      signIn.className = "playlist-auth-prompt";
      signIn.append("Sign in to create and manage your playlists. ");
      const link = document.createElement("a");
      link.href = "login.html";
      link.textContent = "Sign in";
      signIn.append(link);
      playlistGrid.replaceChildren(signIn);
      return;
    }
    await loadPlaylists();
  } catch (error) {
    playlistStatus.textContent = error.message === "Failed to fetch"
      ? "Could not connect to the music server. Please run 'node backend/server.js' and open http://localhost:3000."
      : error.message;
  }
}

initializePlaylists();
