/* ═══════════════════════════════════════════════════════════
   SOUNDS – Web Audio API based sound effects
   No external files needed!
   ═══════════════════════════════════════════════════════════ */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio not supported');
      this.enabled = false;
    }
  }

  play(type) {
    if (!this.enabled || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    switch (type) {
      case 'pick': this._playPick(); break;
      case 'taboo': this._playTaboo(); break;
      case 'tick': this._playTick(); break;
      case 'turnStart': this._playTurnStart(); break;
      case 'gameOver': this._playGameOver(); break;
      case 'join': this._playJoin(); break;
      case 'click': this._playClick(); break;
    }
  }

  _playPick() {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.connect(g);
    g.connect(this.ctx.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(600, this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.1);
    g.gain.setValueAtTime(0.15, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    o.start();
    o.stop(this.ctx.currentTime + 0.2);
  }

  _playTaboo() {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.connect(g);
    g.connect(this.ctx.destination);
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(200, this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.4);
    g.gain.setValueAtTime(0.15, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
    o.start();
    o.stop(this.ctx.currentTime + 0.4);
  }

  _playTick() {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.connect(g);
    g.connect(this.ctx.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(800, this.ctx.currentTime);
    g.gain.setValueAtTime(0.08, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    o.start();
    o.stop(this.ctx.currentTime + 0.05);
  }

  _playTurnStart() {
    [523, 659, 784].forEach((freq, i) => {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.connect(g);
      g.connect(this.ctx.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.08);
      g.gain.setValueAtTime(0.1, this.ctx.currentTime + i * 0.08);
      g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.08 + 0.15);
      o.start(this.ctx.currentTime + i * 0.08);
      o.stop(this.ctx.currentTime + i * 0.08 + 0.15);
    });
  }

  _playGameOver() {
    const melody = [523, 659, 784, 1047, 784, 1047];
    melody.forEach((freq, i) => {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.connect(g);
      g.connect(this.ctx.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.12);
      g.gain.setValueAtTime(0.12, this.ctx.currentTime + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.12 + 0.2);
      o.start(this.ctx.currentTime + i * 0.12);
      o.stop(this.ctx.currentTime + i * 0.12 + 0.25);
    });
  }

  _playJoin() {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.connect(g);
    g.connect(this.ctx.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(440, this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.15);
    g.gain.setValueAtTime(0.1, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    o.start();
    o.stop(this.ctx.currentTime + 0.2);
  }

  _playClick() {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.connect(g);
    g.connect(this.ctx.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(1000, this.ctx.currentTime);
    g.gain.setValueAtTime(0.06, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);
    o.start();
    o.stop(this.ctx.currentTime + 0.04);
  }
}

const soundEngine = new SoundEngine();
