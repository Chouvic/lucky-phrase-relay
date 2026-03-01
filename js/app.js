/* ═══════════════════════════════════════════════════════════
   LUCKY PHRASE RELAY – Main Application Logic (Static)
   Year of the Horse 2026 | JPMC Glasgow
   No server required – runs entirely in the browser!
   ═══════════════════════════════════════════════════════════ */

// ─── State ──────────────────────────────────────────────────
const state = {
  playerName: null,
  greetingStarter: '',
  greetingCloser: '',
  greetingPattern: [],
  timerAnimation: null,
  totalLuck: 0,
  maxLuck: 50,
};

// ─── DOM Refs ───────────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const screens = {
  welcome: $('#screen-welcome'),
  game: $('#screen-game'),
  results: $('#screen-results'),
};

// ─── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Init sound on first interaction
  document.addEventListener('click', () => soundEngine.init(), { once: true });
  document.addEventListener('touchstart', () => soundEngine.init(), { once: true });

  // Setup event listeners
  setupWelcomeEvents();
  setupGameEvents();
  setupResultsEvents();

  // Wire up game engine callbacks
  gameEngine.onTurnStart = handleTurnStart;
  gameEngine.onTilePicked = handleTilePicked;
  gameEngine.onGameOver = handleGameOver;
});

// ─── Screen Navigation ─────────────────────────────────────
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
  window.scrollTo(0, 0);
}

// ═══════════════ WELCOME SCREEN ═══════════════
function setupWelcomeEvents() {
  $('#btn-join-default').addEventListener('click', () => {
    soundEngine.play('click');
    const name = $('#player-name').value.trim();
    if (!name) {
      showError('Please enter your name!');
      $('#player-name').focus();
      return;
    }
    startGame(name);
  });

  $('#player-name').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      $('#btn-join-default').click();
    }
  });
}

function startGame(name) {
  state.playerName = name;

  // Start a new game via the engine
  const gameInfo = gameEngine.startNewGame(name);

  state.greetingStarter = gameInfo.greetingStarter;
  state.greetingCloser = gameInfo.greetingCloser;
  state.greetingPattern = gameInfo.greetingPattern;
  state.totalLuck = 0;

  $('#round-max').textContent = gameInfo.maxRounds;
  showScreen('game');
  updateGreetingDisplay([], state.greetingStarter);
  updateLuckMeter(0);

  // Start first turn after a short delay
  setTimeout(() => gameEngine.startNextTurn(), 800);
}

function showError(msg) {
  const el = $('#welcome-error');
  el.textContent = msg;
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'tabooShake 0.5s ease-out';
  setTimeout(() => { el.textContent = ''; }, 3000);
}

// ═══════════════ GAME ═══════════════
function setupGameEvents() {
  $('#tiles-container').addEventListener('click', (e) => {
    const tile = e.target.closest('.tile');
    if (!tile || tile.classList.contains('disabled')) return;

    soundEngine.play('pick');
    const tileId = tile.dataset.tileId;
    tile.classList.add('picked');

    // Burst particles at tile location
    const rect = tile.getBoundingClientRect();
    particleSystem.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 15);

    // Tell the engine the player picked this tile
    gameEngine.pickTile(tileId);

    // Disable all tiles
    $$('.tile').forEach(t => t.classList.add('disabled'));
  });
}

// ─── Game Engine Callbacks ──────────────────────────────────

function handleTurnStart(data) {
  const { tiles, round, maxRounds, greeting, timerDuration, slotHint, playerName, avatar } = data;

  soundEngine.play('turnStart');
  if (navigator.vibrate) navigator.vibrate(50);

  $('#round-num').textContent = round;
  $('#turn-avatar').textContent = avatar;
  $('#turn-name').textContent = playerName;

  updateGreetingDisplay(greeting, null);
  renderTiles(tiles, true);
  startTimer(timerDuration);

  const hint = $('#tiles-hint');
  if (slotHint) {
    hint.textContent = `⚡ ${slotHint}`;
    hint.className = 'tiles-hint your-turn';
  }
}

function handleTilePicked(data) {
  const { greeting, autoSelected, tabooAlert } = data;

  updateGreetingDisplay(greeting, null);

  let luck = 0;
  greeting.forEach(w => { luck += w.luck; });
  updateLuckMeter(luck);

  if (autoSelected) {
    soundEngine.play('tick');
  }

  if (tabooAlert) {
    showTabooAlert(tabooAlert);
  }
}

function handleGameOver(data) {
  soundEngine.play('gameOver');
  showScreen('results');
  renderResults(data);

  // Fire celebration particles
  setTimeout(() => {
    particleSystem.burst(window.innerWidth / 2, window.innerHeight / 3, 30);
    setTimeout(() => particleSystem.burst(window.innerWidth / 3, window.innerHeight / 2, 20), 300);
    setTimeout(() => particleSystem.burst(window.innerWidth * 2 / 3, window.innerHeight / 2, 20), 600);
  }, 500);
}

// ─── Rendering ──────────────────────────────────────────────

function renderTiles(tiles, isMyTurn) {
  const container = $('#tiles-container');
  container.innerHTML = tiles.map((tile, i) => {
    const chineseLabel = tile.chinese ? `<span class="tile-chinese">${tile.chinese}</span>` : '';
    const meaningLabel = tile.taboo ? `⚠️ ${tile.meaning}` : tile.meaning;
    return `
    <div class="tile ${tile.taboo ? 'taboo-tile' : ''} ${isMyTurn ? '' : 'disabled'}"
         data-tile-id="${tile.id}"
         style="animation-delay: ${i * 0.1}s">
      ${chineseLabel}
      <span class="tile-text">${tile.text}</span>
      <span class="tile-meaning">${meaningLabel}</span>
    </div>`;
  }).join('');
}

function updateGreetingDisplay(greeting, starterText) {
  if (starterText) state.greetingStarter = starterText;

  $('#greeting-starter-text').textContent = state.greetingStarter;

  const wordsContainer = $('#greeting-words');
  let html = '';
  let tileIdx = 0;

  if (state.greetingPattern && state.greetingPattern.length > 0) {
    for (let i = 0; i < state.greetingPattern.length; i++) {
      const step = state.greetingPattern[i];
      if (step.connector) {
        if (tileIdx > 0 && tileIdx < greeting.length) {
          html += `<span class="greeting-connector">${step.connector}</span>`;
        }
      } else {
        if (tileIdx < greeting.length) {
          const w = greeting[tileIdx];
          const cls = w.taboo ? 'taboo' : w.rare ? 'rare' : w.luck >= 2 ? 'lucky' : 'normal';
          html += `<span class="greeting-word ${cls}">${w.text}</span>`;
          tileIdx++;
        } else {
          html += `<span class="greeting-word placeholder">___</span>`;
          break;
        }
      }
    }
    const totalSlots = state.greetingPattern.filter(s => s.slot).length;
    if (greeting.length >= totalSlots && state.greetingCloser) {
      html += `<span class="greeting-connector">${state.greetingCloser}</span>`;
    }
  } else {
    html = greeting.map(w => {
      const cls = w.taboo ? 'taboo' : w.rare ? 'rare' : w.luck >= 2 ? 'lucky' : 'normal';
      return `<span class="greeting-word ${cls}">${w.text}</span>`;
    }).join('');
  }
  wordsContainer.innerHTML = html;
}

function startTimer(duration) {
  const bar = $('#timer-bar');
  bar.classList.remove('running', 'expired');
  bar.style.width = '100%';
  bar.style.transition = 'none';

  bar.offsetHeight; // reflow

  bar.style.transition = `width ${duration}ms linear`;
  bar.classList.add('running');

  if (state.timerAnimation) clearTimeout(state.timerAnimation);
  state.timerAnimation = setTimeout(() => {
    bar.classList.remove('running');
    bar.classList.add('expired');
  }, duration);
}

function updateLuckMeter(luck) {
  state.totalLuck = Math.max(0, luck);
  const pct = Math.min(100, (state.totalLuck / state.maxLuck) * 100);
  $('#luck-bar').style.width = `${pct}%`;
  $('#luck-value').textContent = state.totalLuck;
}

function showTabooAlert(data) {
  soundEngine.play('taboo');
  const overlay = $('#taboo-overlay');
  $('#taboo-tile-text').textContent = `${data.tile.text} (${data.tile.meaning})`;
  $('#taboo-note').textContent = data.culturalNote;
  $('#taboo-player').textContent = `${data.playerName} picked a taboo tile! -${Math.abs(data.tile.luck)} luck`;
  overlay.classList.add('show');

  if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

  setTimeout(() => {
    overlay.classList.remove('show');
  }, 2500);
}

// ═══════════════ RESULTS ═══════════════
function setupResultsEvents() {
  $('#btn-save-screenshot').addEventListener('click', () => {
    soundEngine.play('click');
    saveMemeCardScreenshot();
  });

  $('#btn-play-again').addEventListener('click', () => {
    soundEngine.play('click');
    // Start a fresh game with the same name
    startGame(state.playerName);
  });
}

function renderResults(data) {
  const { greetingText, greeting, score, tabooHits } = data;

  $('#results-grade').textContent = score.grade;

  const memeGreeting = $('#meme-greeting');
  memeGreeting.innerHTML = greetingText.split(' ').map(word => {
    const tile = greeting.find(g => g.text === word);
    if (tile?.taboo) return `<span class="taboo-word">${word}</span>`;
    if (tile?.rare) return `<span class="highlight-word">${word}</span>`;
    return word;
  }).join(' ');

  $('#meme-score-value').textContent = score.total;

  $('#sb-base').textContent = `+${score.baseLuck}`;
  $('#sb-rare').textContent = `+${score.rareBonuses * 2}`;
  $('#sb-rhythm').textContent = `+${score.rhythmBonus}`;
  $('#sb-horse').textContent = `+${score.horseBonus}`;
  $('#sb-total').textContent = score.total;

  if (tabooHits.length > 0) {
    $('#cultural-notes').style.display = 'block';
    $('#cultural-notes-list').innerHTML = tabooHits.map(hit => `
      <div class="cultural-note-item">
        <span class="note-tile">${hit.tile.text}</span> – ${hit.tile.culturalNote}
      </div>
    `).join('');
  } else {
    $('#cultural-notes').style.display = 'none';
  }

  const reviewList = $('#tiles-review-list');
  reviewList.innerHTML = greeting.map((w, i) => {
    const cls = w.taboo ? 'taboo' : w.rare ? 'rare' : w.luck >= 2 ? 'lucky' : 'normal';
    const sign = w.luck >= 0 ? '+' : '';
    return `<span class="review-tile ${cls}" style="animation-delay:${i * 0.05}s">
      ${w.text} <span class="luck-points">${sign}${w.luck}</span>
    </span>`;
  }).join('');
}

async function saveMemeCardScreenshot() {
  const btn = $('#btn-save-screenshot');
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<span class="btn-icon">⏳</span> Capturing...';
  btn.disabled = true;

  try {
    const memeCard = $('#meme-card');
    const canvas = await html2canvas(memeCard, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

    // Try native share (mobile)
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], 'lunar-new-year-meme.png', { type: 'image/png' });
      const shareData = { files: [file], title: '🐴 Lucky Phrase Relay – Year of the Horse' };
      if (navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          btn.innerHTML = '<span class="btn-icon">✅</span> Shared!';
          setTimeout(() => { btn.innerHTML = originalHTML; btn.disabled = false; }, 2000);
          return;
        } catch (e) { /* User cancelled – fall through */ }
      }
    }

    // Fallback: download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'lunar-new-year-meme.png';
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    btn.innerHTML = '<span class="btn-icon">✅</span> Saved!';
    setTimeout(() => { btn.innerHTML = originalHTML; btn.disabled = false; }, 2000);
  } catch (e) {
    console.error('Screenshot failed:', e);
    btn.innerHTML = '<span class="btn-icon">❌</span> Failed — try again';
    setTimeout(() => { btn.innerHTML = originalHTML; btn.disabled = false; }, 2000);
  }
}
