const topicPills = document.querySelectorAll(".topic-pill");
const startBtn = document.querySelector(".explore-banner .primary-btn");
const exploreCards = document.querySelectorAll(".explore-card");

const API_BASE = window.location.port === "3000" ? "" : "http://localhost:3000";

let audio = new Audio();

topicPills.forEach(pill => {
  pill.addEventListener("click", () => {
    topicPills.forEach(p => p.classList.remove("active"));
    pill.classList.add("active");
    playMood(pill.textContent.trim());
  });
});

async function playMood(mood) {
  try {
    const genre = mood === "Lo-fi" ? "Chill" : (mood === "Dance" ? "Pop" : (mood === "Bollywood" ? "Bollywood" : ""));
    const res = await fetch(`${API_BASE}/api/songs?genre=${encodeURIComponent(genre)}`, { credentials: "include" });
    const data = await res.json();
    if (data.songs && data.songs.length > 0) {
      const song = data.songs[Math.floor(Math.random() * data.songs.length)];
      audio.src = song.audio;
      audio.play().catch(() => {});
      if (startBtn) startBtn.textContent = `Playing: ${song.title} ♫`;
    }
  } catch (err) {}
}

if (startBtn) {
  startBtn.addEventListener("click", () => {
    playMood("All moods");
  });
}

const cardMoods = ["Chill", "Hip-Hop", "Chill"];
exploreCards.forEach((card, index) => {
  card.style.cursor = "pointer";
  card.addEventListener("click", () => {
    playMood(cardMoods[index] || "Chill");
  });
});
