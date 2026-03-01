/* ═══════════════════════════════════════════════════════════
   LUCKY PHRASE RELAY – Main Application Logic
   Year of the Horse 2026 | JPMC Glasgow
   Redesigned Journey Flow:
     1. Welcome → 2. Phrase Relay Game → 3. Transition →
     4. Chunlian Builder → 5. Grand Finale + Red Envelope
   ═══════════════════════════════════════════════════════════ */

// ─── State ──────────────────────────────────────────────────
const state = {
  playerName: null,
  scrollTitle: '',
  scrollIntro: '',
  sections: [],
  timerAnimation: null,
  totalLuck: 0,
  maxLuck: 36,
  // Journey data persisted across screens
  gameResult: null,   // stored after game completes
  chunlianData: null, // stored after chunlian completes
  currentJourneyStep: 1,
};

// ─── DOM Refs ───────────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const screens = {
  welcome: $('#screen-welcome'),
  game: $('#screen-game'),
  transition: $('#screen-transition'),
  chunlian: $('#screen-chunlian'),
  finale: $('#screen-finale'),
};

// ─── Fun Facts for Red Envelope ─────────────────────────────
const LUNAR_FUN_FACTS = [
  "🧧 Red envelopes (紅包 hóngbāo) were originally used to ward off evil spirits. The colour red and the money inside were believed to protect children from a demon called '祟' (Suì)!",
  "🎆 The Chinese New Year celebration lasts 15 days, from New Year's Day to the Lantern Festival (元宵節). Each day has its own traditions and activities!",
  "🧹 It's tradition to thoroughly clean your house before New Year to sweep away bad luck — but NEVER sweep on New Year's Day itself, or you'll sweep away good fortune!",
  "🐟 Fish is always served at the New Year dinner but never fully eaten. '年年有餘' (nián nián yǒu yú) — 'surplus every year' — because 魚 (fish) sounds like 餘 (surplus)!",
  "🏮 Over 1.4 billion red envelopes are sent digitally in China during Chinese New Year via WeChat and Alipay — digital hongbao has become a massive tradition!",
  "🎊 Chinese New Year is the largest annual human migration on Earth! Nearly 3 billion trips are made during the 40-day travel period called '春運' (Chūnyùn).",
  "🍊 Mandarin oranges are exchanged during New Year because their Chinese name '橘' (jú) sounds like '吉' (jí, meaning luck). Always give them in pairs for double fortune!",
  "🧨 Firecrackers were originally bamboo stalks thrown into fires — the popping sounds were believed to scare away the monster '年' (Nián) that terrorised villages!",
  "🦁 Lion dances date back over 1,000 years. The lion's movements — blinking eyes, wagging ears — are believed to bring good luck and chase away evil spirits.",
  "📅 Chinese New Year falls on a different date each year because it follows the lunisolar calendar. It always occurs between January 21 and February 20.",
  "🐴 The Horse is the 7th animal in the Chinese zodiac. Legend says the Jade Emperor held a great race, and the Horse would have finished earlier but was startled by a Snake hiding in its hoof!",
  "🥟 Dumplings (餃子 jiǎozi) are shaped like ancient gold ingots (元寶). Eating them symbolises welcoming wealth. Some families hide a coin inside one lucky dumpling!",
  "🔴 The colour red (紅 hóng) is considered the luckiest colour in Chinese culture. It symbolises prosperity, happiness, and good fortune. That's why it's everywhere during New Year!",
  "🎋 The number 8 is extremely lucky because '八' (bā) sounds like '發' (fā, meaning prosperity). The Beijing Olympics began on 08/08/2008 at 8:08 PM!",
  "🌙 The Lantern Festival on the 15th day marks the first full moon of the new year. Families gather to solve riddles written on lanterns and eat sweet rice balls (湯圓 tāngyuán).",
];

const ENVELOPE_WISHES = [
  { title: '恭喜發財', text: 'May wealth and prosperity flow to you from all directions in the Year of the Horse! 🐴💰' },
  { title: '萬事如意', text: 'May everything go exactly as your heart desires — every dream, every goal, every wish! ✨🌟' },
  { title: '龍馬精神', text: 'May you have the spirit of the dragon-horse — boundless energy, unstoppable vitality! 🐉🐴' },
  { title: '馬到成功', text: 'May success gallop to you as swiftly as a champion horse — instant and magnificent! 🏇🏆' },
  { title: '新年快樂', text: 'Wishing you the happiest and most joyful New Year — filled with laughter, love, and fortune! 🎊❤️' },
  { title: '心想事成', text: 'Whatever your heart envisions shall come true — the universe conspires in your favour! 💫🌈' },
  { title: '吉星高照', text: 'May lucky stars shine brightly upon you and guide your path to greatness! ⭐🌠' },
  { title: '福壽雙全', text: 'Wishing you both boundless fortune and long life — the two greatest blessings combined! 🍑🧧' },
];

// ─── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Init sound on first interaction and auto-play background music
  const initAndPlay = () => {
    soundEngine.init();
    // Wait for bg music buffer to load, then auto-play
    const tryPlay = () => {
      if (soundEngine.bgBuffer) {
        soundEngine.startBgMusic();
        $('#music-icon').textContent = '🔊';
      } else {
        setTimeout(tryPlay, 200);
      }
    };
    tryPlay();
  };
  document.addEventListener('click', initAndPlay, { once: true });
  document.addEventListener('touchstart', initAndPlay, { once: true });

  setupMusicToggle();
  setupWelcomeEvents();
  setupGameEvents();
  setupTransitionEvents();
  setupFinaleEvents();
  setupEnvelopeEvents();
  setupChunlianEvents();

  // Wire up game engine callbacks
  gameEngine.onTurnStart = handleTurnStart;
  gameEngine.onTilePicked = handlePhrasePicked;
  gameEngine.onGameOver = handleGameOver;
});

// ─── Screen Navigation ─────────────────────────────────────
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
  window.scrollTo(0, 0);
  updateJourneyProgress(name);
}

function updateJourneyProgress(screenName) {
  const stepMap = {
    welcome: 1,
    game: 2,
    transition: 2,
    chunlian: 3,
    finale: 4,
  };
  const currentStep = stepMap[screenName] || 1;
  state.currentJourneyStep = currentStep;

  const progressBar = $('#journey-progress');
  if (!progressBar) return;

  // Show progress bar on all screens except welcome
  progressBar.style.display = screenName === 'welcome' ? 'none' : 'flex';

  $$('.journey-step').forEach(step => {
    const stepNum = parseInt(step.dataset.step);
    step.classList.remove('completed', 'active');
    if (stepNum < currentStep) step.classList.add('completed');
    if (stepNum === currentStep) step.classList.add('active');
  });

  $$('.journey-connector').forEach((conn, i) => {
    conn.classList.toggle('filled', i + 1 < currentStep);
  });
}

// ─── Music Toggle ───────────────────────────────────────────
function setupMusicToggle() {
  const btn = $('#music-toggle');
  const icon = $('#music-icon');
  btn.addEventListener('click', () => {
    soundEngine.init();
    const isPlaying = soundEngine.toggleBgMusic();
    icon.textContent = isPlaying ? '🔊' : '🔇';
  });
}

// ═══════════════ WELCOME SCREEN ═══════════════
function setupWelcomeEvents() {
  $('#btn-start-journey').addEventListener('click', () => {
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
      $('#btn-start-journey').click();
    }
  });
}

function startGame(name) {
  state.playerName = name;
  state.gameResult = null;
  state.chunlianData = null;

  const gameInfo = gameEngine.startNewGame(name);
  state.scrollTitle = gameInfo.scrollTitle;
  state.scrollIntro = gameInfo.scrollIntro;
  state.sections = gameInfo.sections;
  state.totalLuck = 0;

  $('#round-max').textContent = gameInfo.maxRounds;
  $('#scroll-title').textContent = `📜 ${state.scrollTitle}`;
  $('#scroll-intro').textContent = state.scrollIntro;

  showScreen('game');
  renderScrollLines([], state.sections);
  updateLuckMeter(0);

  setTimeout(() => gameEngine.startNextTurn(), 800);
}

function showError(msg) {
  const el = $('#welcome-error');
  el.textContent = msg;
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = 'tabooShake 0.5s ease-out';
  setTimeout(() => { el.textContent = ''; }, 3000);
}

// ═══════════════ GAME ═══════════════
function setupGameEvents() {
  $('#phrases-container').addEventListener('click', (e) => {
    const card = e.target.closest('.phrase-card');
    if (!card || card.classList.contains('disabled')) return;

    soundEngine.play('pick');
    const phraseId = card.dataset.phraseId;
    card.classList.add('picked');

    const rect = card.getBoundingClientRect();
    particleSystem.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 15);

    gameEngine.pickPhrase(phraseId);
    $$('.phrase-card').forEach(c => c.classList.add('disabled'));
  });
}

// ─── Game Engine Callbacks ──────────────────────────────────
function handleTurnStart(data) {
  const { choices, round, maxRounds, sectionLabel, greeting, timerDuration, playerName, avatar } = data;

  soundEngine.play('turnStart');
  if (navigator.vibrate) navigator.vibrate(50);

  $('#round-num').textContent = round;
  $('#turn-avatar').textContent = avatar;
  $('#turn-name').textContent = playerName;
  $('#section-label').textContent = sectionLabel;
  $('#turn-label').textContent = '— choose a phrase!';

  renderScrollLines(greeting, state.sections);
  renderPhraseChoices(choices);
  startTimer(timerDuration);

  const hint = $('#phrases-hint');
  hint.textContent = `✨ Round ${round}: ${sectionLabel}`;
  hint.className = 'phrases-hint your-turn';
}

function handlePhrasePicked(data) {
  const { greeting, autoSelected, tabooAlert } = data;
  renderScrollLines(greeting, state.sections);

  let luck = 0;
  greeting.forEach(p => { luck += p.luck; });
  updateLuckMeter(luck);

  if (autoSelected) soundEngine.play('tick');
  if (tabooAlert) showTabooAlert(tabooAlert);
}

function handleGameOver(data) {
  // Store game result for later use in finale
  state.gameResult = data;

  soundEngine.play('gameOver');

  // Show transition screen instead of results
  showScreen('transition');
  renderTransition(data);

  // Celebration particles
  setTimeout(() => {
    soundEngine.play('firecracker');
    particleSystem.burst(window.innerWidth / 2, window.innerHeight / 3, 30);
    setTimeout(() => particleSystem.burst(window.innerWidth / 3, window.innerHeight / 2, 20), 300);
    setTimeout(() => {
      soundEngine.play('celebration');
      particleSystem.burst(window.innerWidth * 2 / 3, window.innerHeight / 2, 20);
    }, 600);
  }, 500);
}

// ═══════════════ TRANSITION SCREEN ═══════════════
function setupTransitionEvents() {
  $('#btn-continue-chunlian').addEventListener('click', () => {
    soundEngine.play('whoosh');
    startChunlianFromJourney();
  });
}

function renderTransition(data) {
  const { score } = data;
  $('#transition-grade').textContent = score.grade;
  $('#transition-luck-value').textContent = score.total;
  $('#transition-subtitle').textContent = `${state.playerName}, your Blessing Scroll is complete!`;
}

function startChunlianFromJourney() {
  // Start chunlian as part of the journey flow
  chunlianState.playerName = state.playerName;
  chunlianState.step = 1;
  chunlianState.header = null;
  chunlianState.right = null;
  chunlianState.left = null;
  chunlianState.chosenLength = 0;
  chunlianState.journeyMode = true; // Flag: came from journey

  showScreen('chunlian');
  renderChunlianStep();
}

// ═══════════════ GRAND FINALE ═══════════════
function setupFinaleEvents() {
  // Tab switching
  $$('.finale-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      $$('.finale-tab').forEach(t => t.classList.remove('active'));
      $$('.finale-tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      $(`#finale-tab-${tabName}`).classList.add('active');
      soundEngine.play('click');
    });
  });

  $('#btn-save-screenshot').addEventListener('click', () => {
    soundEngine.play('click');
    saveFinaleScreenshot();
  });

  $('#btn-play-again').addEventListener('click', () => {
    soundEngine.play('click');
    showScreen('welcome');
  });
}

function showFinale() {
  showScreen('finale');
  renderFinale();

  // Grand celebration
  setTimeout(() => {
    soundEngine.play('gong');
    particleSystem.burst(window.innerWidth / 2, window.innerHeight / 4, 40);
    setTimeout(() => {
      soundEngine.play('firecracker');
      particleSystem.burst(window.innerWidth / 3, window.innerHeight / 3, 25);
    }, 500);
    setTimeout(() => {
      soundEngine.play('celebration');
      particleSystem.burst(window.innerWidth * 2 / 3, window.innerHeight / 3, 25);
    }, 1000);
  }, 300);
}

function renderFinale() {
  const gameData = state.gameResult;
  const clData = state.chunlianData;

  if (!gameData || !clData) return;

  const { greeting, sections, scrollTitle, scrollIntro, score, tabooHits, playerName } = gameData;

  $('#finale-player-name').textContent = `${playerName}'s Year of the Horse 2026 Celebration`;

  // ─── Scroll Tab ───
  $('#meme-scroll-title').textContent = scrollTitle;
  const memeGreeting = $('#meme-greeting');
  memeGreeting.innerHTML = greeting.map(phrase => {
    const cls = phrase.taboo ? 'taboo-phrase-line' : phrase.rare ? 'rare-phrase-line' : 'lucky-phrase-line';
    return `<div class="meme-phrase-line ${cls}">
      <span class="meme-chinese">${phrase.chinese}</span>
      <span class="meme-english">${phrase.english}</span>
    </div>`;
  }).join('');

  $('#meme-score-value').textContent = score.total;
  $('#meme-designed-by').textContent = `Designed by ${playerName}`;

  // Score breakdown
  $('#sb-base').textContent = `+${score.baseLuck}`;
  $('#sb-rare').textContent = `+${score.rareBonuses * 2}`;
  $('#sb-rhythm').textContent = `+${score.rhythmBonus}`;
  $('#sb-horse').textContent = `+${score.horseBonus}`;
  $('#sb-diversity').textContent = `+${score.diversityBonus}`;
  $('#sb-total').textContent = score.total;

  // Cultural notes
  if (tabooHits.length > 0) {
    $('#cultural-notes').style.display = 'block';
    $('#cultural-notes-list').innerHTML = tabooHits.map(hit => `
      <div class="cultural-note-item">
        <span class="note-tile">${hit.phrase.chinese}</span>
        <span class="note-english">${hit.phrase.english}</span>
        <p>${hit.phrase.culturalNote}</p>
      </div>
    `).join('');
  } else {
    $('#cultural-notes').style.display = 'none';
  }

  // Phrase review
  const reviewList = $('#phrases-review-list');
  reviewList.innerHTML = greeting.map((phrase, i) => {
    const section = sections[i];
    const cls = phrase.taboo ? 'review-taboo' : phrase.rare ? 'review-rare' : 'review-lucky';
    const sign = phrase.luck >= 0 ? '+' : '';
    return `
    <div class="review-phrase ${cls}" style="animation-delay:${i * 0.08}s">
      <div class="review-phrase-header">
        <span class="review-section-label">${section?.label || ''}</span>
        <span class="review-luck">${sign}${phrase.luck} 🍀</span>
      </div>
      <div class="review-phrase-body">
        <span class="review-chinese">${phrase.chinese}</span>
        <span class="review-pinyin">${phrase.pinyin}</span>
        <span class="review-english">${phrase.english}</span>
      </div>
      <div class="review-phrase-note">${phrase.meaning}</div>
    </div>`;
  }).join('');

  // ─── Chunlian Tab ───
  renderFinaleChunlian(clData);

  // ─── Combined Tab ───
  renderCombinedView(gameData, clData);
}

function renderFinaleChunlian(clData) {
  const wishEl = $('#finale-chunlian-wish');
  wishEl.innerHTML = `
    <p class="cl-wish-text">🐴 <strong>${clData.playerName}</strong>, here is your Spring Couplet!</p>
    <p class="cl-wish-sub">May the blessings of <em>${clData.header.english}</em> bring you
    <em>${clData.right.english.toLowerCase()}</em> and <em>${clData.left.english.toLowerCase()}</em>
    in the Year of the Horse 2026! 🏇</p>
  `;

  const visual = $('#finale-chunlian-visual');
  const headerChars = clData.header.chinese.split('').map(c =>
    `<span class="cl-vis-char">${c}</span>`
  ).join('');
  const rightChars = clData.right.chinese.split('').map(c =>
    `<span class="cl-vis-char">${c}</span>`
  ).join('');
  const leftChars = clData.left.chinese.split('').map(c =>
    `<span class="cl-vis-char">${c}</span>`
  ).join('');

  visual.innerHTML = `
    <div class="cl-display">
      <div class="cl-header-scroll">
        <div class="cl-scroll-paper cl-horizontal">${headerChars}</div>
        <div class="cl-header-english">${clData.header.english}</div>
      </div>
      <div class="cl-body-scrolls">
        <div class="cl-vertical-scroll cl-left-scroll">
          <div class="cl-scroll-paper cl-vertical">${leftChars}</div>
          <div class="cl-scroll-label">左聯 · Left</div>
          <div class="cl-scroll-english">${clData.left.english}</div>
        </div>
        <div class="cl-fu-diamond"><span class="cl-fu-char">福</span></div>
        <div class="cl-vertical-scroll cl-right-scroll">
          <div class="cl-scroll-paper cl-vertical">${rightChars}</div>
          <div class="cl-scroll-label">右聯 · Right</div>
          <div class="cl-scroll-english">${clData.right.english}</div>
        </div>
      </div>
      <div class="cl-display-footer">
        <span>🏮 JPMC Glasgow 🏮</span>
        <span>Year of the Horse 2026</span>
        <span>Designed by ${clData.playerName}</span>
      </div>
    </div>
  `;
}

function renderCombinedView(gameData, clData) {
  const container = $('#combined-display');
  const { greeting, scrollTitle, score, playerName } = gameData;

  container.innerHTML = `
    <div class="combined-card" id="combined-card">
      <div class="combined-card-inner">
        <div class="combined-header-section">
          <div class="combined-title-deco">🏮🐴🏮</div>
          <h3 class="combined-main-title">${playerName}'s Lunar New Year 2026</h3>
          <p class="combined-subtitle">JPMC Glasgow Celebration</p>
        </div>
        <div class="combined-two-col">
          <div class="combined-scroll-side">
            <h4>📜 ${scrollTitle}</h4>
            <div class="combined-scroll-phrases">
              ${greeting.map(phrase => {
                const cls = phrase.taboo ? 'combined-taboo' : phrase.rare ? 'combined-rare' : '';
                return `<div class="combined-phrase ${cls}">
                  <span class="combined-chinese">${phrase.chinese}</span>
                  <span class="combined-english">${phrase.english}</span>
                </div>`;
              }).join('')}
            </div>
            <div class="combined-score">Luck Score: ${score.total} ✨</div>
          </div>
          <div class="combined-chunlian-side">
            <h4>🧧 春聯 Spring Couplet</h4>
            <div class="combined-chunlian-mini">
              <div class="combined-cl-header">${clData.header.chinese}</div>
              <div class="combined-cl-scrolls">
                <div class="combined-cl-right">${clData.right.chinese.split('').join('<br>')}</div>
                <div class="combined-cl-fu">福</div>
                <div class="combined-cl-left">${clData.left.chinese.split('').join('<br>')}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="combined-footer">
          <span>🐴 Year of the Horse 2026</span>
          <span>Created by ${playerName}</span>
        </div>
      </div>
    </div>
  `;
}

// ═══════════════ RED ENVELOPE ═══════════════
function setupEnvelopeEvents() {
  $('#btn-open-envelope').addEventListener('click', () => {
    soundEngine.play('click');
    openEnvelopeOverlay();
  });

  $('#envelope-closed').addEventListener('click', () => {
    openEnvelopeReveal();
  });

  $('#btn-close-envelope').addEventListener('click', () => {
    soundEngine.play('click');
    closeEnvelopeOverlay();
  });

  $('#envelope-overlay').addEventListener('click', (e) => {
    if (e.target === $('#envelope-overlay')) {
      closeEnvelopeOverlay();
    }
  });
}

function openEnvelopeOverlay() {
  const overlay = $('#envelope-overlay');
  const closed = $('#envelope-closed');
  const opened = $('#envelope-opened');

  closed.style.display = 'flex';
  opened.style.display = 'none';
  closed.classList.remove('opening');

  overlay.classList.add('show');
  soundEngine.play('whoosh');
}

function openEnvelopeReveal() {
  const closed = $('#envelope-closed');
  const opened = $('#envelope-opened');

  closed.classList.add('opening');
  soundEngine.play('envelopeOpen');

  const wish = ENVELOPE_WISHES[Math.floor(Math.random() * ENVELOPE_WISHES.length)];
  const fact = LUNAR_FUN_FACTS[Math.floor(Math.random() * LUNAR_FUN_FACTS.length)];

  $('#envelope-wish-title').textContent = wish.title;
  $('#envelope-wish-text').textContent = `Dear ${state.playerName}, ${wish.text}`;
  $('#envelope-fun-fact-text').textContent = fact;

  setTimeout(() => {
    closed.style.display = 'none';
    opened.style.display = 'block';
    particleSystem.burst(window.innerWidth / 2, window.innerHeight / 3, 30);
    setTimeout(() => particleSystem.burst(window.innerWidth / 2, window.innerHeight / 2, 20), 200);
  }, 800);
}

function closeEnvelopeOverlay() {
  const overlay = $('#envelope-overlay');
  overlay.classList.remove('show');
}

// ─── Rendering ──────────────────────────────────────────────

function renderPhraseChoices(choices) {
  const container = $('#phrases-container');
  container.innerHTML = choices.map((phrase, i) => {
    const isTaboo = phrase.taboo;
    const rareTag = phrase.rare ? '<span class="phrase-rare-tag">✨ Rare</span>' : '';
    const luckIndicator = isTaboo
      ? `<span class="phrase-luck taboo-luck">⚠️ ${phrase.luck}</span>`
      : `<span class="phrase-luck lucky-luck">🍀 +${phrase.luck}</span>`;

    return `
    <div class="phrase-card ${isTaboo ? 'taboo-card-choice' : ''}"
         data-phrase-id="${phrase.id}"
         style="animation-delay: ${i * 0.15}s">
      <div class="phrase-card-main">
        <span class="phrase-chinese">${phrase.chinese}</span>
        <span class="phrase-pinyin">${phrase.pinyin}</span>
      </div>
      <div class="phrase-card-details">
        <span class="phrase-english">${phrase.english}</span>
        <span class="phrase-meaning">${phrase.meaning}</span>
      </div>
      <div class="phrase-card-meta">
        ${luckIndicator}
        <span class="phrase-category">${phrase.category}</span>
        ${rareTag}
      </div>
    </div>`;
  }).join('');
}

function renderScrollLines(greeting, sections) {
  const container = $('#scroll-lines');
  let html = '';

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (i < greeting.length) {
      const phrase = greeting[i];
      const cls = phrase.taboo ? 'scroll-line-taboo' : phrase.rare ? 'scroll-line-rare' : 'scroll-line-lucky';
      html += `
      <div class="scroll-line ${cls}" style="animation-delay: ${i * 0.05}s">
        <span class="scroll-line-label">${section.label}</span>
        <span class="scroll-line-chinese">${phrase.chinese}</span>
        <span class="scroll-line-english">${phrase.english}</span>
      </div>`;
    } else if (i === greeting.length) {
      // Current picking slot
      html += `
      <div class="scroll-line scroll-line-active">
        <span class="scroll-line-label">${section.label}</span>
        <span class="scroll-line-placeholder">???</span>
      </div>`;
    } else {
      // Future slot
      html += `
      <div class="scroll-line scroll-line-empty">
        <span class="scroll-line-label">${section.label}</span>
        <span class="scroll-line-placeholder">···</span>
      </div>`;
    }
  }

  container.innerHTML = html;
}

function startTimer(duration) {
  const bar = $('#timer-bar');
  bar.classList.remove('running', 'expired');
  bar.style.width = '100%';
  bar.style.transition = 'none';

  bar.offsetHeight;

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
  $('#taboo-phrase-chinese').textContent = data.phrase.chinese;
  $('#taboo-phrase-english').textContent = `${data.phrase.english} — ${data.phrase.meaning}`;
  $('#taboo-note').textContent = data.culturalNote;
  $('#taboo-player').textContent = `${data.playerName} picked a taboo phrase! ${data.phrase.luck} luck`;
  overlay.classList.add('show');

  if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

  setTimeout(() => {
    overlay.classList.remove('show');
  }, 5500);
}

// ═══════════════ SCREENSHOT ═══════════════
async function saveFinaleScreenshot() {
  const btn = $('#btn-save-screenshot');
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<span class="btn-icon">⏳</span> Capturing...';
  btn.disabled = true;

  try {
    const activeTab = $('.finale-tab.active');
    const tabName = activeTab ? activeTab.dataset.tab : 'scroll';
    let targetEl;

    if (tabName === 'combined') {
      targetEl = $('#combined-card');
    } else if (tabName === 'chunlian') {
      targetEl = $('#finale-chunlian-visual');
    } else {
      targetEl = $('#meme-card');
    }

    if (!targetEl) targetEl = $('#meme-card');

    const canvas = await html2canvas(targetEl, {
      backgroundColor: tabName === 'chunlian' ? '#8B0000' : null,
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

    if (navigator.share && navigator.canShare) {
      const file = new File([blob], 'lunar-new-year-2026.png', { type: 'image/png' });
      const shareData = { files: [file], title: '🐴 Lucky Phrase Relay – Year of the Horse' };
      if (navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          btn.innerHTML = '<span class="btn-icon">✅</span> Shared!';
          setTimeout(() => { btn.innerHTML = originalHTML; btn.disabled = false; }, 2000);
          return;
        } catch (e) { /* User cancelled */ }
      }
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'lunar-new-year-2026.png';
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
