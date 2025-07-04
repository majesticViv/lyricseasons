// --- State ---
let lyrics = JSON.parse(localStorage.getItem("seasonalLyrics") || "[]");
const SEASONS = [
  { key: "spring", label: "春", emoji: "🌱" },
  { key: "summer", label: "夏", emoji: "🌸" },
  { key: "autumn", label: "秋", emoji: "🍂" },
  { key: "winter", label: "冬", emoji: "❄️" }
];

const app = document.getElementById('app');

function saveLyrics() {
  localStorage.setItem("seasonalLyrics", JSON.stringify(lyrics));
}

// Define the four season background colors
const SEASON_BG_COLORS = [
  getComputedStyle(document.documentElement).getPropertyValue('--spring-bg').trim() || '#f7faf7',
  getComputedStyle(document.documentElement).getPropertyValue('--summer-bg').trim() || '#fdf6fa',
  getComputedStyle(document.documentElement).getPropertyValue('--autumn-bg').trim() || '#fdf8f4',
  getComputedStyle(document.documentElement).getPropertyValue('--winter-bg').trim() || '#f6f8fa'
];

let landingBgAnimIndex = 0;
let landingBgAnimTimeout = null;
let landingBgAnimPaused = false;

function animateLandingBg() {
  if (landingBgAnimPaused) return;
  landingBgAnimIndex = (landingBgAnimIndex + 1) % SEASON_BG_COLORS.length;
  document.body.style.background = SEASON_BG_COLORS[landingBgAnimIndex];
  landingBgAnimTimeout = setTimeout(animateLandingBg, 3500);
}

function startLandingBgAnim() {
  landingBgAnimPaused = false;
  clearTimeout(landingBgAnimTimeout);
  animateLandingBg();
}

function stopLandingBgAnim() {
  landingBgAnimPaused = true;
  clearTimeout(landingBgAnimTimeout);
}

function setLandingBgToSeason(seasonKey) {
  stopLandingBgAnim();
  let color;
  switch (seasonKey) {
    case 'spring': color = SEASON_BG_COLORS[0]; break;
    case 'summer': color = SEASON_BG_COLORS[1]; break;
    case 'autumn': color = SEASON_BG_COLORS[2]; break;
    case 'winter': color = SEASON_BG_COLORS[3]; break;
    default: color = SEASON_BG_COLORS[0];
  }
  document.body.style.background = color;
}

// --- Landing Page ---
function renderLanding() {
  document.body.style.background = SEASON_BG_COLORS[0];
  document.getElementById('page-root').innerHTML = `
    <div class="landing-bg">
      <span class="floating-icon spring" style="left:10vw;top:12vh;animation-delay:0s;">🌱</span>
      <span class="floating-icon summer" style="left:70vw;top:18vh;animation-delay:1.2s;">🌸</span>
      <span class="floating-icon autumn" style="left:30vw;top:60vh;animation-delay:2.1s;">🍂</span>
      <span class="floating-icon winter" style="left:80vw;top:70vh;animation-delay:2.7s;">❄️</span>
    </div>
    <div class="landing-content">
      <div class="landing-title">lyric of the seasons</div>
      <div class="landing-prompt">ready to add your seasonal thoughts?</div>
      <div class="landing-actions" style="justify-content:center;">
        <span class="add-emoji-btn" id="add-lyric-btn" role="button" tabindex="0" aria-label="add new lyric">✏️</span>
      </div>
      <div style="margin: 2em 0 0.5em 0; color: #888; font-size: 1.1rem;">or enter your seasons…</div>
      <div class="landing-seasons">
        ${SEASONS.map(s => `
          <div class="landing-season" data-season="${s.key}">
            <span class="landing-season-emoji">${s.emoji}</span>
          </div>
        `).join('')}
      </div>
        </div>
  `;
  document.getElementById('add-lyric-btn').onclick = () => showAddLyricModal();
  document.getElementById('add-lyric-btn').onkeydown = e => {
    if (e.key === 'Enter' || e.key === ' ') showAddLyricModal();
  };
  document.querySelectorAll('.landing-season').forEach(el => {
    el.onmouseenter = () => setLandingBgToSeason(el.dataset.season);
    el.onmouseleave = () => startLandingBgAnim();
    el.onclick = () => transitionPage(() => renderSeasonPage(el.dataset.season));
  });
  startLandingBgAnim();
}

// --- Season Select Page ---
function renderSeasonSelect() {
  app.innerHTML = `
    <div class="landing-content">
      <div class="landing-title">choose a season</div>
      <div class="landing-seasons">
        ${SEASONS.map(s => `
          <div class="landing-season" data-season="${s.key}">
            <span class="landing-season-emoji">${s.emoji}</span>
          </div>
        `).join('')}
      </div>
      <button class="landing-btn" id="back-to-landing">back</button>
    </div>
  `;
  document.getElementById('back-to-landing').onclick = renderLanding;
  document.querySelectorAll('.landing-season').forEach(el => {
    el.onclick = () => renderSeasonPage(el.dataset.season);
  });
}

// --- Season Page ---
function renderSeasonPage(season) {
  document.body.style.background = `var(--${season}-bg)`;
  document.getElementById('page-root').innerHTML = `
    <div class="season-page ${season}">
      <button class="season-back" title="back">&larr;</button>
      <div class="season-header">${SEASONS.find(s => s.key === season).emoji} ${season}</div>
      <div class="floating-lyrics-area" id="floating-lyrics-area"></div>
      <button class="add-lyric-btn" id="add-lyric-btn">add new lyric</button>
    </div>
  `;
  document.querySelector('.season-back').onclick = () => {
    transitionPage(() => renderLanding());
  };
  document.getElementById('add-lyric-btn').onclick = () => showAddLyricModal(season);
  renderFloatingLyrics(season);
}

// --- Floating Lyric Cards ---
function renderFloatingLyrics(season) {
  const area = document.getElementById('floating-lyrics-area');
  area.innerHTML = '';
  const seasonLyrics = lyrics.filter(l => l.season === season);
  const areaW = area.offsetWidth || window.innerWidth;
  const areaH = 600;
  seasonLyrics.forEach((entry, i) => {
    const card = document.createElement('div');
    card.className = `floating-lyric-card ${season}`;
    // Random position (avoid overlap for small n)
    const left = 10 + Math.random() * 70;
    const top = 5 + Math.random() * 60;
    card.style.left = `${left}%`;
    card.style.top = `${top}vh`;
    card.style.zIndex = 1 + Math.floor(Math.random() * 10);
    card.innerHTML = `
      ${entry.song || entry.artist ? `<div class="floating-lyric-song">${entry.song ? entry.song : ''}${entry.artist ? ' — ' + entry.artist : ''}</div>` : ''}
      <div class="floating-lyric-text">${escapeHTML(entry.lyric)}</div>
      <div class="floating-lyric-meta">
        <span>${escapeHTML(entry.time)}</span>
        <button class="floating-lyric-delete" title="delete">&times;</button>
      </div>
    `;
    card.querySelector('.floating-lyric-delete').onclick = () => {
      if (confirm('delete this lyric?')) {
        lyrics = lyrics.filter(l => l !== entry);
        saveLyrics();
        renderFloatingLyrics(season);
      }
    };
    area.appendChild(card);
  });
}

// --- Add Lyric Modal ---
function showAddLyricModal(defaultSeason) {
  const modalBg = document.createElement('div');
  modalBg.className = 'add-lyric-modal-bg';
  modalBg.innerHTML = `
    <div class="add-lyric-modal bubble-modal-in">
      <button class="add-lyric-modal-close" title="close">&times;</button>
      <form class="add-lyric-form">
        <textarea placeholder="write the lyric here..." required></textarea>
        <div style="display:flex;gap:10px;">
          <input type="text" placeholder="song name (optional)" />
          <input type="text" placeholder="artist (optional)" />
        </div>
        <div style="display:flex;gap:10px;justify-content:center;">
          ${SEASONS.map(s => `
            <button type="button" class="season-btn ${s.key}${defaultSeason===s.key?' selected':''}" data-season="${s.key}">
              <span>${s.emoji}</span>
            </button>
          `).join('')}
        </div>
        <button type="submit">save lyric</button>
      </form>
    </div>
  `;
  document.body.appendChild(modalBg);

  let selected = defaultSeason || 'spring';
  modalBg.querySelectorAll('.season-btn').forEach(btn => {
    btn.onclick = () => {
      selected = btn.dataset.season;
      modalBg.querySelectorAll('.season-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    };
  });

  modalBg.querySelector('.add-lyric-modal-close').onclick = () => {
    const modal = modalBg.querySelector('.add-lyric-modal');
    modal.classList.remove('bubble-modal-in');
    modal.classList.add('bubble-modal-out');
    setTimeout(() => document.body.removeChild(modalBg), 350);
  };

  modalBg.querySelector('form').onsubmit = function(e) {
    e.preventDefault();
    const lyric = this.querySelector('textarea').value.trim();
    const song = this.querySelectorAll('input')[0].value.trim();
    const artist = this.querySelectorAll('input')[1].value.trim();
    if (!lyric) return;
    const time = new Date().toLocaleString();
    lyrics.push({ lyric, song, artist, time, season: selected });
    saveLyrics();
    document.body.removeChild(modalBg);
    if (typeof renderFloatingLyrics === 'function' && document.getElementById('floating-lyrics-area')) {
      renderFloatingLyrics(selected);
    }
  };
}

// --- Utility ---
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m] || m));
}

// --- Start ---
transitionPage(() => renderLanding());

function transitionPage(renderFn) {
  const root = document.getElementById('page-root');
  if (!root) {
    renderFn();
    return;
  }
  root.classList.add('page-fade-out');
  setTimeout(() => {
    renderFn();
    const newRoot = document.getElementById('page-root');
    newRoot.classList.add('page-fade');
    newRoot.classList.remove('page-fade-out');
    // Force reflow to trigger transition
    void newRoot.offsetWidth;
    setTimeout(() => {
      newRoot.classList.remove('page-fade');
    }, 320);
  }, 220); // Start new content a bit before the fade is fully done for a snappier feel
}

function renderLoading() {
  app.innerHTML = `
    <div class="loading-page">
      <span class="loading-emoji" aria-label="loading" role="img">💭</span>
    </div>
  `;
}

function fadeMixTransition(renderFn) {
  const root = document.getElementById('page-root');
  if (!root) {
    // If not present, just render
    renderFn();
    return;
  }
  // Start fade out
  root.classList.remove('fade-mix-enter', 'fade-mix-enter-active');
  root.classList.add('fade-mix-exit');
  setTimeout(() => {
    root.classList.add('fade-mix-exit-active');
    setTimeout(() => {
      // Replace content
      renderFn();
      const newRoot = document.getElementById('page-root');
      newRoot.classList.add('fade-mix-enter');
      setTimeout(() => {
        newRoot.classList.add('fade-mix-enter-active');
        // Clean up classes after animation
        setTimeout(() => {
          newRoot.classList.remove('fade-mix-enter', 'fade-mix-enter-active', 'fade-mix-exit', 'fade-mix-exit-active');
        }, 500);
      }, 10);
    }, 400);
  }, 10);
}

localStorage.removeItem('seasonalLyrics');