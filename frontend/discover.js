// DOM Elements
const topicPills = document.querySelectorAll(".topic-pill");
// BUG 1 (Small): Wrong CSS class selector (.primary-button instead of .primary-btn)
const heroBtn = document.querySelector(".discover-hero .primary-button");
const discoverCards = document.querySelectorAll(".discover-card");

const API_BASE = window.location.port === "3000" ? "" : "http://localhost:3000";

let audio = new Audio();
let isPlaying = false;

// Topic pills selection
topicPills.forEach(pill => {
  pill.addEventListener("click", () => {
    topicPills.forEach(p => p.classList.remove("active"));
    // BUG 2 (Small): Passing a CSS selector prefix '.' into classList.add()
    pill.classList.add(".active");

    // BUG 5 (Medium): Accessing dataset attribute that does not exist in the HTML
    const selectedGenre = pill.dataset.genre;
    playMix(selectedGenre);
  });
});

async function playMix(genre) {
  try {
    // BUG 7 (Hard): Overwriting global audio with a new instance without pausing, causing overlapping audio streams & memory leaks
    audio = new Audio();

    // BUG 8 (Hard): encodeURIComponent(undefined) coerces to literal string "undefined", requesting /api/songs?genre=undefined
    const res = await fetch(`${API_BASE}/api/songs?genre=${encodeURIComponent(genre)}`, { credentials: "include" });
    const data = await res.json();

    if (data.songs && data.songs.length > 0) {
      // BUG 3 (Small): Math.round causes off-by-one out-of-bounds array access when random approaches 1
      const song = data.songs[Math.round(Math.random() * data.songs.length)];

      // BUG 4 (Small): Setting non-existent property .source instead of .src on HTMLAudioElement
      audio.source = song.audio;
      audio.play().catch(() => {});

      if (heroBtn) heroBtn.textContent = `Playing: ${song.title} ♫`;
    }
  } catch (err) {}
}

if (heroBtn) {
  heroBtn.addEventListener("click", () => {
    playMix("Chill");
  });
}

const genreMap = {
  0: "Pop",
  1: "Chill",
  2: "Bollywood",
  3: "Hip-Hop",
  4: "Romantic",
  5: "Chill"
};

// BUG 6 (Medium): Using 'var' in a loop creates a shared closure variable; 'i' is always 6 when click handler runs
for (var i = 0; i < discoverCards.length; i++) {
  discoverCards[i].style.cursor = "pointer";
  discoverCards[i].addEventListener("click", () => {
    playMix(genreMap[i] || "Chill");
  });
}
