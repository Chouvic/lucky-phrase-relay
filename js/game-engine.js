/* ═══════════════════════════════════════════════════════════
   GAME ENGINE – All game logic, previously on the server
   Now runs entirely in the browser – no server needed!
   ═══════════════════════════════════════════════════════════ */

class GameEngine {
  constructor() {
    this.state = null; // current game state
    this.timerHandle = null;
    this.onTurnStart = null;   // callback(turnData)
    this.onTilePicked = null;  // callback(pickData)
    this.onGameOver = null;    // callback(resultData)
  }

  // Simple UUID replacement – crypto.randomUUID or fallback
  _uuid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return 'xxxx-xxxx-xxxx'.replace(/x/g, () =>
      Math.floor(Math.random() * 16).toString(16)
    );
  }

  // Pick a random greeting template
  _pickTemplate() {
    return GREETING_TEMPLATES[Math.floor(Math.random() * GREETING_TEMPLATES.length)];
  }

  // Get a random avatar
  _getRandomAvatar() {
    return AVATARS[Math.floor(Math.random() * AVATARS.length)];
  }

  // Generate random tiles for a given slot
  _getRandomTiles(count, requiredSlot, forceTaboo) {
    const tiles = [];
    const slotTiles = LUCKY_TILES.filter(t => t.slot === requiredSlot);
    const tabooForSlot = TABOO_TILES.filter(t => t.slot === requiredSlot);

    // Include a taboo tile ~25% of the time or if forced
    const includeTaboo = (forceTaboo || Math.random() < 0.25) && tabooForSlot.length > 0;
    if (includeTaboo) {
      const taboo = tabooForSlot[Math.floor(Math.random() * tabooForSlot.length)];
      tiles.push({ ...taboo, id: this._uuid() });
    }

    // Fill remaining with lucky tiles from the matching slot
    const pool = [...slotTiles];
    while (tiles.length < count && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      const tile = pool.splice(idx, 1)[0];
      tiles.push({ ...tile, id: this._uuid() });
    }

    // Shuffle
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    return tiles;
  }

  // Calculate final score
  _calculateScore() {
    const gs = this.state;
    let luck = 0;
    let rareBonuses = 0;
    let tabooCount = 0;
    const words = gs.greeting;

    words.forEach(w => {
      luck += w.luck;
      if (w.rare) rareBonuses++;
      if (w.taboo) tabooCount++;
    });

    // Rhythm bonus
    let streak = 0, maxStreak = 0;
    words.forEach(w => {
      if (w.luck > 0) { streak++; maxStreak = Math.max(maxStreak, streak); }
      else streak = 0;
    });
    const rhythmBonus = maxStreak >= 4 ? 5 : maxStreak >= 3 ? 3 : maxStreak >= 2 ? 1 : 0;

    // Horse bonus
    const horseBonus = words.filter(w =>
      ['🐴', '🐎', '🏇'].includes(w.text) || w.chinese === '馬' || w.chinese === '駿馬' || w.chinese === '賽馬'
    ).length * 2;

    const total = luck + rareBonuses * 2 + rhythmBonus + horseBonus;
    return {
      baseLuck: luck,
      rareBonuses,
      rhythmBonus,
      horseBonus,
      tabooCount,
      total: Math.max(0, total),
      maxPossible: gs.maxRounds * 5,
      grade: total >= 35 ? '🏆 Supreme Fortune!' :
             total >= 25 ? '🎊 Magnificent Luck!' :
             total >= 15 ? '🎆 Auspicious Blessings!' :
             total >= 5  ? '🏮 Modest Fortune' :
                           '💨 The Horse Galloped Away...',
    };
  }

  // Build the greeting text string
  buildGreetingText() {
    const gs = this.state;
    const pattern = gs.greetingPattern;
    const pickedTiles = gs.greeting;
    let parts = [gs.greetingStarter];
    let tileIndex = 0;

    for (let i = 0; i < pattern.length; i++) {
      const step = pattern[i];
      if (step.connector) {
        parts.push(step.connector);
      } else if (tileIndex < pickedTiles.length) {
        parts.push(pickedTiles[tileIndex].text);
        tileIndex++;
      }
    }

    if (tileIndex >= pattern.filter(s => s.slot).length) {
      parts.push(gs.greetingCloser);
    }

    return parts.join(' ');
  }

  // ─── Public API ───────────────────────────────────────────

  // Start a new game for the given player name
  startNewGame(playerName) {
    this.clearTimer();

    const template = this._pickTemplate();
    const starter = template.starter.replace('{name}', playerName);
    const avatar = this._getRandomAvatar();

    this.state = {
      playerName,
      avatar,
      status: 'picking', // picking | finished
      greeting: [],
      greetingTemplate: template,
      greetingStarter: starter,
      greetingCloser: template.closer,
      greetingPattern: template.pattern,
      currentPatternIndex: 0,
      round: 0,
      maxRounds: template.pattern.filter(s => s.slot).length,
      timerDuration: 10000,
      totalLuck: 0,
      tabooHits: [],
      currentTiles: null,
    };

    return {
      greetingStarter: this.state.greetingStarter,
      greetingCloser: this.state.greetingCloser,
      greetingPattern: this.state.greetingPattern,
      maxRounds: this.state.maxRounds,
      avatar: this.state.avatar,
    };
  }

  // Start the next turn – calls onTurnStart callback
  startNextTurn() {
    const gs = this.state;
    if (!gs || gs.status !== 'picking') return;

    // Advance past connector steps
    while (gs.currentPatternIndex < gs.greetingPattern.length && gs.greetingPattern[gs.currentPatternIndex].connector) {
      gs.currentPatternIndex++;
    }

    // If we've exhausted the pattern, end the game
    if (gs.currentPatternIndex >= gs.greetingPattern.length) {
      setTimeout(() => this._endGame(), 500);
      return;
    }

    const currentStep = gs.greetingPattern[gs.currentPatternIndex];
    const forceTaboo = (gs.round % 2 === 1);
    const tiles = this._getRandomTiles(3, currentStep.slot, forceTaboo);
    gs.currentTiles = tiles;

    const slotHints = {
      adj: '✨ Pick an adjective!',
      noun: '🎁 Pick a blessing!',
      emoji: '🎉 Pick an emoji!',
    };

    if (this.onTurnStart) {
      this.onTurnStart({
        tiles,
        round: gs.round + 1,
        maxRounds: gs.maxRounds,
        greetingText: this.buildGreetingText(),
        greeting: gs.greeting,
        timerDuration: gs.timerDuration,
        slotHint: slotHints[currentStep.slot] || 'Pick a tile!',
        slotType: currentStep.slot,
        playerName: gs.playerName,
        avatar: gs.avatar,
      });
    }

    // Auto-pick if timer runs out
    this.clearTimer();
    this.timerHandle = setTimeout(() => {
      if (gs.status !== 'picking') return;
      const randomTile = tiles[Math.floor(Math.random() * tiles.length)];
      this._pickTileInternal(randomTile, true);
    }, gs.timerDuration + 500);
  }

  // Player picks a tile by ID
  pickTile(tileId) {
    const gs = this.state;
    if (!gs || gs.status !== 'picking') return;

    this.clearTimer();

    const tile = gs.currentTiles?.find(t => t.id === tileId);
    if (!tile) return;

    this._pickTileInternal(tile, false);
  }

  _pickTileInternal(tile, autoSelected) {
    const gs = this.state;

    gs.greeting.push(tile);
    gs.totalLuck += tile.luck;
    gs.currentPatternIndex++;

    const result = {
      tile,
      playerName: gs.playerName,
      greeting: gs.greeting,
      greetingText: this.buildGreetingText(),
      round: gs.round + 1,
      totalRounds: gs.maxRounds,
      autoSelected,
      tabooAlert: null,
    };

    if (tile.taboo) {
      gs.tabooHits.push({ tile, player: gs.playerName });
      result.tabooAlert = {
        culturalNote: tile.culturalNote,
        playerName: gs.playerName,
        tile: tile,
      };
    }

    if (this.onTilePicked) {
      this.onTilePicked(result);
    }

    gs.round++;
    if (gs.round >= gs.maxRounds) {
      setTimeout(() => this._endGame(), 1500);
    } else {
      const delay = tile.taboo ? 3000 : 1500;
      setTimeout(() => this.startNextTurn(), delay);
    }
  }

  _endGame() {
    const gs = this.state;
    if (!gs) return;
    gs.status = 'finished';
    this.clearTimer();

    const score = this._calculateScore();
    const greetingText = this.buildGreetingText();

    if (this.onGameOver) {
      this.onGameOver({
        greetingText,
        greeting: gs.greeting,
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

// Export as global
const gameEngine = new GameEngine();
