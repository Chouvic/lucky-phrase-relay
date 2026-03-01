/* ═══════════════════════════════════════════════════════════
   SOUNDS – Web Audio API based sound effects
   Festive Lunar New Year themed!
   Chinese pentatonic scale, gong, drums & firecrackers
   ═══════════════════════════════════════════════════════════ */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.initialized = false;
    this.bgGain = null;  // background music gain node
    this.bgPlaying = false;
    this.bgSource = null;
    this.bgBuffer = null;
    this.bgMuted = false;
  }

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
      this._loadBgMusic();
    } catch (e) {
      console.warn('Web Audio not supported');
      this.enabled = false;
    }
  }

  async _loadBgMusic() {
    try {
      const response = await fetch('bg-music-60s.mp3');
      const arrayBuffer = await response.arrayBuffer();
      this.bgBuffer = await this.ctx.decodeAudioData(arrayBuffer);
    } catch (e) {
      console.warn('Could not load background music:', e);
    }
  }

  startBgMusic() {
    if (!this.enabled || !this.ctx || !this.bgBuffer || this.bgPlaying) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    this.bgGain = this.ctx.createGain();
    this.bgGain.gain.setValueAtTime(this.bgMuted ? 0 : 0.15, this.ctx.currentTime);
    this.bgGain.connect(this.ctx.destination);

    this.bgSource = this.ctx.createBufferSource();
    this.bgSource.buffer = this.bgBuffer;
    this.bgSource.loop = true;
    this.bgSource.connect(this.bgGain);
    this.bgSource.start(0);
    this.bgPlaying = true;
  }

  stopBgMusic() {
    if (this.bgSource) {
      try { this.bgSource.stop(); } catch (e) { /* already stopped */ }
      this.bgSource = null;
    }
    this.bgPlaying = false;
  }

  toggleBgMusic() {
    if (!this.bgPlaying) {
      this.startBgMusic();
      this.bgMuted = false;
      return true; // now playing
    }
    this.bgMuted = !this.bgMuted;
    if (this.bgGain) {
      this.bgGain.gain.setTargetAtTime(
        this.bgMuted ? 0 : 0.15,
        this.ctx.currentTime,
        0.1
      );
    }
    return !this.bgMuted; // return true if audible
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
      case 'gong': this._playGong(); break;
      case 'firecracker': this._playFirecracker(); break;
      case 'celebration': this._playCelebration(); break;
    }
  }

  // ─── Helper: Create noise buffer (for drums / crackers) ───
  _createNoiseBuffer(duration) {
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // ─── Lucky pick: bright pentatonic arpeggio ───
  _playPick() {
    const t = this.ctx.currentTime;
    // Chinese pentatonic: C D E G A
    const notes = [523, 587, 659, 784, 880];
    const pick = notes[Math.floor(Math.random() * notes.length)];
    const second = notes[Math.floor(Math.random() * notes.length)];

    [pick, second].forEach((freq, i) => {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.connect(g);
      g.connect(this.ctx.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, t + i * 0.07);
      o.frequency.exponentialRampToValueAtTime(freq * 1.02, t + i * 0.07 + 0.1);
      g.gain.setValueAtTime(0.15, t + i * 0.07);
      g.gain.exponentialRampToValueAtTime(0.01, t + i * 0.07 + 0.18);
      o.start(t + i * 0.07);
      o.stop(t + i * 0.07 + 0.2);
    });

    // Add a tiny shimmer
    const shimmer = this.ctx.createOscillator();
    const sg = this.ctx.createGain();
    shimmer.connect(sg);
    sg.connect(this.ctx.destination);
    shimmer.type = 'triangle';
    shimmer.frequency.setValueAtTime(pick * 2, t + 0.1);
    sg.gain.setValueAtTime(0.04, t + 0.1);
    sg.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    shimmer.start(t + 0.1);
    shimmer.stop(t + 0.35);
  }

  // ─── Taboo: dramatic gong + low rumble ───
  _playTaboo() {
    const t = this.ctx.currentTime;

    // Low gong hit
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.connect(g);
    g.connect(this.ctx.destination);
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(55, t + 0.8);
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.8);
    o.start(t);
    o.stop(t + 0.8);

    // Metallic shimmer
    const o2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    o2.connect(g2);
    g2.connect(this.ctx.destination);
    o2.type = 'square';
    o2.frequency.setValueAtTime(280, t);
    o2.frequency.exponentialRampToValueAtTime(100, t + 0.6);
    g2.gain.setValueAtTime(0.06, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    o2.start(t);
    o2.stop(t + 0.6);

    // Noise burst (impact)
    const noise = this.ctx.createBufferSource();
    noise.buffer = this._createNoiseBuffer(0.15);
    const ng = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);
    noise.connect(filter);
    filter.connect(ng);
    ng.connect(this.ctx.destination);
    ng.gain.setValueAtTime(0.12, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    noise.start(t);
    noise.stop(t + 0.15);
  }

  // ─── Timer tick: woodblock-like ───
  _playTick() {
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.connect(g);
    g.connect(this.ctx.destination);
    o.type = 'triangle';
    o.frequency.setValueAtTime(1200, t);
    o.frequency.exponentialRampToValueAtTime(800, t + 0.03);
    g.gain.setValueAtTime(0.1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    o.start(t);
    o.stop(t + 0.06);
  }

  // ─── Turn start: ascending pentatonic fanfare ───
  _playTurnStart() {
    const t = this.ctx.currentTime;
    // Chinese pentatonic: C E G C5
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.connect(g);
      g.connect(this.ctx.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, t + i * 0.09);
      g.gain.setValueAtTime(0.12, t + i * 0.09);
      g.gain.exponentialRampToValueAtTime(0.01, t + i * 0.09 + 0.18);
      o.start(t + i * 0.09);
      o.stop(t + i * 0.09 + 0.2);
    });

    // Drum hit
    const drum = this.ctx.createOscillator();
    const dg = this.ctx.createGain();
    drum.connect(dg);
    dg.connect(this.ctx.destination);
    drum.type = 'sine';
    drum.frequency.setValueAtTime(150, t);
    drum.frequency.exponentialRampToValueAtTime(50, t + 0.12);
    dg.gain.setValueAtTime(0.15, t);
    dg.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    drum.start(t);
    drum.stop(t + 0.15);
  }

  // ─── Game over: festive celebration melody ───
  _playGameOver() {
    const t = this.ctx.currentTime;
    // Celebratory pentatonic melody: C5 D5 E5 G5 A5 G5 E5 G5 C6
    const melody = [523, 587, 659, 784, 880, 784, 659, 784, 1047];
    melody.forEach((freq, i) => {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.connect(g);
      g.connect(this.ctx.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, t + i * 0.13);
      g.gain.setValueAtTime(0.12, t + i * 0.13);
      g.gain.exponentialRampToValueAtTime(0.01, t + i * 0.13 + 0.22);
      o.start(t + i * 0.13);
      o.stop(t + i * 0.13 + 0.25);
    });

    // Gong at the end
    const total = melody.length * 0.13;
    const gong = this.ctx.createOscillator();
    const gg = this.ctx.createGain();
    gong.connect(gg);
    gg.connect(this.ctx.destination);
    gong.type = 'sawtooth';
    gong.frequency.setValueAtTime(180, t + total);
    gong.frequency.exponentialRampToValueAtTime(90, t + total + 1.2);
    gg.gain.setValueAtTime(0.1, t + total);
    gg.gain.exponentialRampToValueAtTime(0.001, t + total + 1.2);
    gong.start(t + total);
    gong.stop(t + total + 1.2);

    // Cymbal shimmer
    const cymbal = this.ctx.createOscillator();
    const cg = this.ctx.createGain();
    cymbal.connect(cg);
    cg.connect(this.ctx.destination);
    cymbal.type = 'triangle';
    cymbal.frequency.setValueAtTime(3000, t + total);
    cymbal.frequency.exponentialRampToValueAtTime(1500, t + total + 0.8);
    cg.gain.setValueAtTime(0.04, t + total);
    cg.gain.exponentialRampToValueAtTime(0.001, t + total + 0.8);
    cymbal.start(t + total);
    cymbal.stop(t + total + 0.8);
  }

  // ─── Join: welcoming gong shimmer ───
  _playJoin() {
    const t = this.ctx.currentTime;
    // Warm welcome chord
    const chord = [440, 554, 659];
    chord.forEach((freq, i) => {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.connect(g);
      g.connect(this.ctx.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.08, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      o.start(t);
      o.stop(t + 0.4);
    });

    // Rising shimmer
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.connect(g);
    g.connect(this.ctx.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(880, t + 0.15);
    o.frequency.exponentialRampToValueAtTime(1760, t + 0.35);
    g.gain.setValueAtTime(0.06, t + 0.15);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    o.start(t + 0.15);
    o.stop(t + 0.4);
  }

  // ─── Click: crisp tap ───
  _playClick() {
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.connect(g);
    g.connect(this.ctx.destination);
    o.type = 'triangle';
    o.frequency.setValueAtTime(1200, t);
    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    o.start(t);
    o.stop(t + 0.05);
  }

  // ─── Gong: deep resonant Chinese gong ───
  _playGong() {
    const t = this.ctx.currentTime;

    // Fundamental
    const o1 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    o1.connect(g1);
    g1.connect(this.ctx.destination);
    o1.type = 'sawtooth';
    o1.frequency.setValueAtTime(160, t);
    o1.frequency.exponentialRampToValueAtTime(80, t + 2);
    g1.gain.setValueAtTime(0.15, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 2);
    o1.start(t);
    o1.stop(t + 2);

    // Overtone
    const o2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    o2.connect(g2);
    g2.connect(this.ctx.destination);
    o2.type = 'sine';
    o2.frequency.setValueAtTime(320, t);
    o2.frequency.exponentialRampToValueAtTime(160, t + 1.5);
    g2.gain.setValueAtTime(0.06, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
    o2.start(t);
    o2.stop(t + 1.5);

    // Metallic noise
    const noise = this.ctx.createBufferSource();
    noise.buffer = this._createNoiseBuffer(0.3);
    const ng = this.ctx.createGain();
    const hpf = this.ctx.createBiquadFilter();
    hpf.type = 'bandpass';
    hpf.frequency.setValueAtTime(2000, t);
    hpf.Q.setValueAtTime(2, t);
    noise.connect(hpf);
    hpf.connect(ng);
    ng.connect(this.ctx.destination);
    ng.gain.setValueAtTime(0.06, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    noise.start(t);
    noise.stop(t + 0.3);
  }

  // ─── Firecracker: rapid pops ───
  _playFirecracker() {
    const t = this.ctx.currentTime;
    const count = 6 + Math.floor(Math.random() * 5);
    for (let i = 0; i < count; i++) {
      const delay = i * (0.04 + Math.random() * 0.06);
      const noise = this.ctx.createBufferSource();
      noise.buffer = this._createNoiseBuffer(0.04);
      const ng = this.ctx.createGain();
      const hpf = this.ctx.createBiquadFilter();
      hpf.type = 'highpass';
      hpf.frequency.setValueAtTime(1000 + Math.random() * 3000, t + delay);
      noise.connect(hpf);
      hpf.connect(ng);
      ng.connect(this.ctx.destination);
      ng.gain.setValueAtTime(0.08 + Math.random() * 0.08, t + delay);
      ng.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.04);
      noise.start(t + delay);
      noise.stop(t + delay + 0.05);
    }
  }

  // ─── Celebration: short festive burst with drums and melody ───
  _playCelebration() {
    const t = this.ctx.currentTime;

    // Drum pattern (4 hits)
    [0, 0.15, 0.3, 0.38].forEach(offset => {
      const drum = this.ctx.createOscillator();
      const dg = this.ctx.createGain();
      drum.connect(dg);
      dg.connect(this.ctx.destination);
      drum.type = 'sine';
      drum.frequency.setValueAtTime(120, t + offset);
      drum.frequency.exponentialRampToValueAtTime(40, t + offset + 0.1);
      dg.gain.setValueAtTime(0.15, t + offset);
      dg.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.12);
      drum.start(t + offset);
      drum.stop(t + offset + 0.12);
    });

    // Pentatonic melody over drums
    const melody = [784, 880, 1047, 880, 784, 1047];
    melody.forEach((freq, i) => {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.connect(g);
      g.connect(this.ctx.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, t + 0.45 + i * 0.1);
      g.gain.setValueAtTime(0.1, t + 0.45 + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.01, t + 0.45 + i * 0.1 + 0.15);
      o.start(t + 0.45 + i * 0.1);
      o.stop(t + 0.45 + i * 0.1 + 0.18);
    });
  }
}

const soundEngine = new SoundEngine();
