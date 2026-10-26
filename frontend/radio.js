const listenBtn = document.querySelector(".radio-hero .primary-btn");
const stationTitle = document.querySelector(".radio-hero h2");
const stationDesc = document.querySelector(".radio-hero p");
const statusPill = document.querySelector(".header-tools .status-pill");

const API_BASE = window.location.port === "3000" ? "" : "http://localhost:3000";

let audio = new Audio();
let currentStationId = "sunset-fm";
let isPlaying = false;

async function tuneIn(stationId) {
  try {
    const res = await fetch(`${API_BASE}/api/radio/stations/${stationId}/now-playing`, { credentials: "include" });
    if (!res.ok) throw new Error("Could not load station.");
    const data = await res.json();

    currentStationId = stationId;
    stationTitle.textContent = `${data.station.name} (${data.station.frequency})`;
    stationDesc.textContent = `Now Playing: ${data.currentSong.title} — ${data.currentSong.artist} (${data.currentSong.genre})`;

    if (isPlaying) {
      audio.src = data.currentSong.audio;
      audio.currentTime = data.elapsedSeconds || 0;
      audio.play().catch(() => {});
    }
  } catch (err) {
    stationDesc.textContent = "Unable to connect to live station feed.";
  }
}

if (listenBtn) {
  listenBtn.addEventListener("click", async () => {
    if (!isPlaying) {
      try {
        const res = await fetch(`${API_BASE}/api/radio/stations/${currentStationId}/now-playing`, { credentials: "include" });
        const data = await res.json();
        audio.src = data.currentSong.audio;
        audio.currentTime = data.elapsedSeconds || 0;
        await audio.play();
        isPlaying = true;
        listenBtn.textContent = "Ⅱ Pause Live";
        statusPill.textContent = "● Live On Air";
        statusPill.style.background = "linear-gradient(135deg, #ef4444, #dc2626)";
      } catch (err) {
        listenBtn.textContent = "▶ Listen Live";
      }
    } else {
      audio.pause();
      isPlaying = false;
      listenBtn.textContent = "▶ Listen Live";
      statusPill.textContent = "● Offline Mode";
      statusPill.style.background = "rgba(255, 255, 255, 0.1)";
    }
  });
}

// Initial fetch
tuneIn("sunset-fm");
