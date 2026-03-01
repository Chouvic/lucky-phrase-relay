/* ═══════════════════════════════════════════════════════════
   GAME ENGINE – Wisdom Phrase Relay
   Year of the Horse 2026 | JPMC Glasgow
   Players build a blessing scroll by choosing between
   two wisdom phrases per round. Each round presents one
   phrase per line — a curated choice of Chinese wisdom.
   ═══════════════════════════════════════════════════════════ */

class GameEngine {
  constructor() {
    this.state = null;
    this.timerHandle = null;
    this.onTurnStart = null;
    this.onTilePicked = null;
    this.onGameOver = null;
  }

  _uuid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return 'xxxx-xxxx-xxxx'.replace(/x/g, () =>
      Math.floor(Math.random() * 16).toString(16)
    );
  }

  _pickTemplate() {
    return SCROLL_TEMPLATES[Math.floor(Math.random() * SCROLL_TEMPLATES.length)];
  }

  _getRandomAvatar() {
    return AVATARS[Math.floor(Math.random() * AVATARS.length)];
  }

  // Get 2 phrase choices for a given pool category
  // One might be taboo (~25% chance)
  _getChoicesForPool(poolName, forceTaboo) {
    const luckyPool = [...(PHRASE_POOLS[poolName] || ALL_LUCKY_PHRASES)];
    const choices = [];

    // Possibly include a taboo phrase
    const includeTaboo = (forceTaboo || Math.random() < 0.25) && TABOO_PHRASES.length > 0;
    if (includeTaboo) {
      const taboo = TABOO_PHRASES[Math.floor(Math.random() * TABOO_PHRASES.length)];
      choices.push({ ...taboo, id: this._uuid() });
    }

    // Pick from the lucky pool, avoiding already-picked phrases
    const usedChinese = new Set(this.state.greeting.map(g => g.chinese));
    const available = luckyPool.filter(p => !usedChinese.has(p.chinese));
    const pool = available.length >= 2 ? available : luckyPool;

    // Shuffle and pick
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    while (choices.length < 2 && pool.length > 0) {
      const phrase = pool.pop();
      // Don't add duplicate of taboo's chinese text
      if (!choices.some(c => c.chinese === phrase.chinese)) {
        choices.push({ ...phrase, id: this._uuid() });
      }
    }

    // Shuffle final order
    if (choices.length === 2 && Math.random() > 0.5) {
      [choices[0], choices[1]] = [choices[1], choices[0]];
    }

    return choices;
  }

  _calculateScore() {
    const gs = this.state;
    let luck = 0;
    let rareBonuses = 0;
    let tabooCount = 0;
    const phrases = gs.greeting;

    phrases.forEach(p => {
      luck += p.luck;
      if (p.rare) rareBonuses++;
      if (p.taboo) tabooCount++;
    });

    // Streak bonus: consecutive positive-luck phrases
    let streak = 0, maxStreak = 0;
    phrases.forEach(p => {
      if (p.luck > 0) { streak++; maxStreak = Math.max(maxStreak, streak); }
      else streak = 0;
    });
    const rhythmBonus = maxStreak >= 5 ? 8 : maxStreak >= 4 ? 5 : maxStreak >= 3 ? 3 : 0;

    // Horse bonus: extra points for horse-category phrases
    const horseBonus = phrases.filter(p => p.category === 'horse' && !p.taboo).length * 2;

    // Diversity bonus: unique categories
    const categories = new Set(phrases.filter(p => !p.taboo).map(p => p.category));
    const diversityBonus = categories.size >= 5 ? 5 : categories.size >= 4 ? 3 : categories.size >= 3 ? 1 : 0;

    const total = luck + rareBonuses * 2 + rhythmBonus + horseBonus + diversityBonus;
    return {
      baseLuck: luck,
      rareBonuses,
      rhythmBonus,
      horseBonus,
      diversityBonus,
      tabooCount,
      total: Math.max(0, total),
      maxPossible: gs.maxRounds * 6,
      grade: total >= 40 ? '🏆 Supreme Fortune! 鴻運當頭' :
             total >= 30 ? '🎊 Magnificent Luck! 大吉大利' :
             total >= 20 ? '🎆 Auspicious Blessings! 吉星高照' :
             total >= 10 ? '🏮 Modest Fortune 小有福氣' :
                           '💨 The Horse Galloped Away... 馬失前蹄',
    };
  }

  buildGreetingText() {
    const gs = this.state;
    const parts = [gs.scrollIntro + '\n'];
    gs.greeting.forEach((phrase, i) => {
      const section = gs.sections[i];
      const label = section ? section.label : '';
      parts.push(`${phrase.chinese}  ${phrase.english}`);
    });
    return parts.join('\n');
  }

  // ─── Public API ───────────────────────────────────────────

  startNewGame(playerName) {
    this.clearTimer();

    const template = this._pickTemplate();
    const intro = template.intro.replace('{name}', playerName);
    const avatar = this._getRandomAvatar();

    this.state = {
      playerName,
      avatar,
      status: 'picking',
      greeting: [],
      scrollTemplate: template,
      scrollTitle: template.title,
      scrollIntro: intro,
      sections: template.sections,
      round: 0,
      maxRounds: template.sections.length,
      timerDuration: 12000,
      totalLuck: 0,
      tabooHits: [],
      currentChoices: null,
    };

    return {
      scrollTitle: this.state.scrollTitle,
      scrollIntro: this.state.scrollIntro,
      sections: this.state.sections,
      maxRounds: this.state.maxRounds,
      avatar: this.state.avatar,
    };
  }

  startNextTurn() {
    const gs = this.state;
    if (!gs || gs.status !== 'picking') return;

    if (gs.round >= gs.maxRounds) {
      setTimeout(() => this._endGame(), 500);
      return;
    }

    const section = gs.sections[gs.round];
    const forceTaboo = (gs.round % 3 === 2); // taboo every 3rd round
    const choices = this._getChoicesForPool(section.pool, forceTaboo);
    gs.currentChoices = choices;

    if (this.onTurnStart) {
      this.onTurnStart({
        choices,
        round: gs.round + 1,
        maxRounds: gs.maxRounds,
        sectionLabel: section.label,
        sectionPool: section.pool,
        greeting: gs.greeting,
        timerDuration: gs.timerDuration,
        playerName: gs.playerName,
        avatar: gs.avatar,
      });
    }

    // Auto-pick if timer runs out
    this.clearTimer();
    this.timerHandle = setTimeout(() => {
      if (gs.status !== 'picking') return;
      // Auto-pick the first non-taboo choice, or random
      const safe = choices.find(c => !c.taboo) || choices[0];
      this._pickPhraseInternal(safe, true);
    }, gs.timerDuration + 500);
  }

  pickPhrase(phraseId) {
    const gs = this.state;
    if (!gs || gs.status !== 'picking') return;
    this.clearTimer();

    const phrase = gs.currentChoices?.find(c => c.id === phraseId);
    if (!phrase) return;
    this._pickPhraseInternal(phrase, false);
  }

  _pickPhraseInternal(phrase, autoSelected) {
    const gs = this.state;

    gs.greeting.push(phrase);
    gs.totalLuck += phrase.luck;

    const result = {
      phrase,
      playerName: gs.playerName,
      greeting: gs.greeting,
      round: gs.round + 1,
      totalRounds: gs.maxRounds,
      autoSelected,
      tabooAlert: null,
    };

    if (phrase.taboo) {
      gs.tabooHits.push({ phrase, player: gs.playerName });
      result.tabooAlert = {
        culturalNote: phrase.culturalNote,
        playerName: gs.playerName,
        phrase,
      };
    }

    if (this.onTilePicked) {
      this.onTilePicked(result);
    }

    gs.round++;
    if (gs.round >= gs.maxRounds) {
      setTimeout(() => this._endGame(), 1500);
    } else {
      const delay = phrase.taboo ? 6000 : 1800;
      setTimeout(() => this.startNextTurn(), delay);
    }
  }

  _endGame() {
    const gs = this.state;
    if (!gs) return;
    gs.status = 'finished';
    this.clearTimer();

    const score = this._calculateScore();

    if (this.onGameOver) {
      this.onGameOver({
        greeting: gs.greeting,
        sections: gs.sections,
        scrollTitle: gs.scrollTitle,
        scrollIntro: gs.scrollIntro,
        score,
        tabooHits: gs.tabooHits,
        playerName: gs.playerName,
      });
    }
  }

  clearTimer() {
    if (this.timerHandle) {
      clearTimeout(this.timerHandle);
      this.timerHandle = null;
    }
  }
}

const gameEngine = new GameEngine();
