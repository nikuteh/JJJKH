/**
 * app.js — Chordle main application logic
 *
 * Structure:
 *  1. State
 *  2. Router (page switching)
 *  3. Component renderers (renderSongList, renderLesson, etc.)
 *  4. Lesson logic (chip moves, check answer, feedback)
 *  5. UI helpers (makeChip, makeVinylSVG, makeWaveform)
 *  6. Init
 */

// ─────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────

const state = {
  currentPage: "home",
  currentSong: null,
  currentTab: null,         // active section key e.g. "verse"
  lessonStates: {},         // keyed by section: { zone, bank, status }
};

// ─────────────────────────────────────────────
// RENDERERING
// ─────────────────────────────────────────────

function openLesson(song) {
  state.currentSong = song;
  const sectionKeys = Object.keys(song.sections);
  state.currentTab  = sectionKeys[0];

  // Build per-section lesson state (zone, bank, status)
  state.lessonStates = {};
  sectionKeys.forEach(k => {
    state.lessonStates[k] = {
      zone:   [],
      bank:   shuffle([...song.sections[k].bank]),
      status: null,   // null | "correct" | "incorrect"
    };
  });

  // Populate static lesson header
  document.getElementById("lesson-title").textContent = song.title;
  document.getElementById("lesson-meta").textContent  =
    `${song.artist}`;

  // Vinyl decorations
  const header = document.getElementById("lesson-header");
  let vinyl = header.querySelector(".lesson-vinyl");
  if (!vinyl) {
    vinyl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    vinyl.classList.add("vinyl-rings", "lesson-vinyl");
    header.prepend(vinyl);
  }
  drawVinyl(vinyl, 110);

  // Tabs
  renderTabs(sectionKeys);

  // Render first section
  renderSection();
}

function renderTabs(sectionKeys) {
  const tabsEl = document.getElementById("section-tabs");
  tabsEl.innerHTML = "";
  sectionKeys.forEach(k => {
    const sec = state.currentSong.sections[k];
    const btn = document.createElement("button");
    btn.className = "tab-btn" + (k === state.currentTab ? " active" : "");
    btn.dataset.key = k;
    btn.innerHTML = `${sec.emoji} ${sec.label}`;
    btn.addEventListener("click", () => {
      state.currentTab = k;
      document.querySelectorAll(".tab-btn").forEach(b =>
        b.classList.toggle("active", b.dataset.key === k)
      );
      renderSection();
    });
    tabsEl.appendChild(btn);
  });
}

function updateTabDoneMarker() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    const k    = btn.dataset.key;
    const done = state.lessonStates[k]?.status === "correct";
    const sec  = state.currentSong.sections[k];
    btn.innerHTML = `${sec.emoji} ${sec.label}${done ? " ✓" : ""}`;
  });
}

function renderSection() {
  const key    = state.currentTab;
  const sec    = state.currentSong.sections[key];
  const ls     = state.lessonStates[key];

  // Challenge header
  document.getElementById("challenge-title").textContent =
    `Arrange the ${sec.label.toLowerCase()} chord progression`;
  document.getElementById("sentiment-pill").innerHTML =
    `🎭 ${sec.sentiment}`;

  // Drop zone
  renderDropZone();

  // Word bank
  renderBank();

  // Feedback
  renderFeedback();

  // Button
  renderButton();
}

function renderDropZone() {
  const key  = state.currentTab;
  const ls   = state.lessonStates[key];
  const zone = document.getElementById("drop-zone");

  zone.innerHTML = "";
  zone.className = "drop-zone";

  const placeholder = document.createElement("div");
  placeholder.id = "drop-placeholder";
  placeholder.className = "drop-placeholder";
  placeholder.textContent = "Tap chords to place them here";
  placeholder.style.display = ls.zone.length === 0 ? "flex" : "none";
  zone.appendChild(placeholder);

  if (ls.status === "correct")   zone.classList.add("correct");
  if (ls.status === "incorrect") zone.classList.add("incorrect");

  ls.zone.forEach((chord, i) => {
    const chip = makeChip(chord, () => moveToBank(chord, i));
    if (ls.status === "correct")   { chip.style.animationDelay = `${i * 60}ms`; chip.classList.add("anim-bounce"); }
    if (ls.status === "incorrect") { chip.style.animationDelay = `${i * 60}ms`; chip.classList.add("anim-shake");  }
    zone.appendChild(chip);
  });

  // Remove hint
  const hint = document.getElementById("remove-hint");
  hint.style.display = (ls.zone.length > 0 && !ls.status) ? "block" : "none";
}

function renderBank() {
  const key  = state.currentTab;
  const ls   = state.lessonStates[key];
  const bank = document.getElementById("word-bank");
  bank.innerHTML = "";
  ls.bank.forEach((chord, i) => {
    bank.appendChild(makeChip(chord, () => moveToZone(chord, i)));
  });
}

function renderFeedback() {
  const key = state.currentTab;
  const ls  = state.lessonStates[key];
  const sec = state.currentSong.sections[key];
  const fb  = document.getElementById("feedback");

  if (!ls.status) {
    fb.style.display = "none";
    fb.className = "feedback";
    return;
  }

  fb.style.display = "flex";
  fb.className = `feedback ${ls.status} anim-fadein`;

  if (ls.status === "correct") {
    fb.innerHTML = `
      <div class="feedback-icon">🌿</div>
      <div>
        <div class="feedback-head">Beautiful — that's it!</div>
        <div class="feedback-sub">${sec.sentiment} — you felt it correctly.</div>
      </div>`;
  } else {
    fb.innerHTML = `
      <div class="feedback-icon">🍂</div>
      <div>
        <div class="feedback-head">Not quite right</div>
        <div class="feedback-sub">Correct order: <strong>${sec.correctOrder.join(" → ")}</strong></div>
      </div>`;
  }
}

function renderButton() {
  const key = state.currentTab;
  const ls  = state.lessonStates[key];
  const btn = document.getElementById("check-btn");

  btn.className = "check-btn";
  btn.onclick = null;

  if (ls.status === "incorrect") {
    btn.textContent = "Try again";
    btn.disabled = false;
    btn.classList.add("try-again");
    btn.onclick = tryAgain;
  } else if (ls.status === "correct") {
    btn.textContent = "Continue →";
    btn.disabled = false;
    btn.classList.add("continue");
    btn.onclick = goNextSection;
  } else {
    btn.textContent = "Check answer";
    btn.disabled = ls.zone.length === 0;
    btn.onclick = checkAnswer;
  }
}

// ── Chord movement ──

function moveToZone(chord, bankIndex) {
  const ls = state.lessonStates[state.currentTab];
  if (ls.status === "correct") return;
  ls.bank.splice(bankIndex, 1);
  ls.zone.push(chord);
  ls.status = null;
  renderSection();
}

function moveToBank(chord, zoneIndex) {
  const ls = state.lessonStates[state.currentTab];
  if (ls.status === "correct") return;
  ls.zone.splice(zoneIndex, 1);
  ls.bank.push(chord);
  ls.status = null;
  renderSection();
}

function checkAnswer() {
  const key = state.currentTab;
  const ls  = state.lessonStates[key];
  const sec = state.currentSong.sections[key];
  const correct = JSON.stringify(ls.zone) === JSON.stringify(sec.correctOrder);
  ls.status = correct ? "correct" : "incorrect";
  if (correct) updateTabDoneMarker();
  renderSection();
}

function tryAgain() {
  const key = state.currentTab;
  const sec = state.currentSong.sections[key];
  state.lessonStates[key] = {
    zone: [],
    bank: shuffle([...sec.bank]),
    status: null,
  };
  renderSection();
}

function goNextSection() {
  const keys = Object.keys(state.currentSong.sections);
  const i    = keys.indexOf(state.currentTab);
  const next = keys[(i + 1) % keys.length];
  state.currentTab = next;

  document.querySelectorAll(".tab-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.key === next)
  );
  renderSection();
}

// ─────────────────────────────────────────────
// UI HELPERS
// ─────────────────────────────────────────────

function makeChip(chord, onClick) {
  const c = typeof getChordColor === 'function' ? getChordColor(chord) : { bg: '#fff', text: '#000', border: '#ccc', shadow: '#999' };
  const chip = document.createElement("button");
  chip.className = "chip";
  chip.textContent = chord;
  chip.style.cssText = `
    background: ${c.bg};
    color: ${c.text};
    border-color: ${c.border};
    box-shadow: 0 3px 0 ${c.shadow};
  `;
  chip.addEventListener("mouseenter", () => {
    chip.style.transform  = "translateY(-3px)";
    chip.style.boxShadow  = `0 6px 0 ${c.shadow}`;
  });
  chip.addEventListener("mouseleave", () => {
    chip.style.transform  = "";
    chip.style.boxShadow  = `0 3px 0 ${c.shadow}`;
  });
  chip.addEventListener("mousedown", () => {
    chip.style.transform  = "translateY(1px)";
    chip.style.boxShadow  = `0 1px 0 ${c.shadow}`;
  });
  chip.addEventListener("click", onClick);
  return chip;
}

/** Draw vinyl ring SVG into an existing SVG element */
function drawVinyl(svgEl, size) {
  svgEl.setAttribute("viewBox", "0 0 80 80");
  svgEl.setAttribute("width",  size);
  svgEl.setAttribute("height", size);
  svgEl.innerHTML = `
    ${[38,32,26,20,14,8,4].map((r,i) =>
      `<circle cx="40" cy="40" r="${r}" fill="none" stroke="#5c3a1e" stroke-width="${i===0?2:1}"/>`
    ).join("")}
    <circle cx="40" cy="40" r="5" fill="#5c3a1e"/>`;
}

/** Fisher-Yates shuffle */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
// FRONTEND GET REQUEST FOR RANDOMIZATION
async function loadLesson() {
  const song = await getRandomSong();

  document.getElementById("lesson-title").textContent = song.title;
  document.getElementById("lesson-meta").textContent = song.artist;

  if (song.spotifyId) {
    document.getElementById("spotify-embed-container").innerHTML =
      createSpotifyEmbed(song.spotifyId);
  }
}

// ─────────────────────────────────────────────
// INIT TODO: FIX with backend files
// ─────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 1. Ask the backend for the lesson data
    const response = await fetch('/api/get-lesson');
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // 2. Parse the database response into a JavaScript object
    const songData = await response.json();

    // 3. Kick off the lesson with the dynamic data
    openLesson(songData);

  } catch (error) {
    console.error("Failed to load lesson data from backend:", error);
    document.getElementById("challenge-title").textContent = "Error loading lesson data. Please try again later.";
  }
});