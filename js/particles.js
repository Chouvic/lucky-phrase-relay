/* ═══════════════════════════════════════════════════════════
   PARTICLES – Floating lanterns, sparkles, and fireworks
   ═══════════════════════════════════════════════════════════ */

class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.maxParticles = 40;
    this.running = true;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.init();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle());
    }
  }

  createParticle() {
    const types = ['sparkle', 'lantern', 'petal'];
    const type = types[Math.floor(Math.random() * types.length)];
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -Math.random() * 0.8 - 0.2,
      size: Math.random() * 4 + 2,
      life: Math.random(),
      maxLife: 1,
      type,
      opacity: Math.random() * 0.3 + 0.1,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      color: type === 'lantern'
        ? `hsl(${15 + Math.random() * 30}, 90%, ${50 + Math.random() * 20}%)`
        : type === 'sparkle'
        ? `hsl(${40 + Math.random() * 20}, 100%, ${70 + Math.random() * 20}%)`
        : `hsl(${340 + Math.random() * 30}, 70%, ${70 + Math.random() * 20}%)`,
    };
  }

  update() {
    this.particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.life -= 0.002;

      // Wind effect
      p.vx += Math.sin(Date.now() * 0.001 + i) * 0.01;

      if (p.life <= 0 || p.y < -20 || p.x < -20 || p.x > this.canvas.width + 20) {
        this.particles[i] = this.createParticle();
        this.particles[i].y = this.canvas.height + 10;
        this.particles[i].life = 1;
      }
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.globalAlpha = p.opacity * p.life;

      if (p.type === 'sparkle') {
        // Draw 4-point star
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI) / 2;
          const outerR = p.size;
          const innerR = p.size * 0.3;
          this.ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
          this.ctx.lineTo(Math.cos(angle + Math.PI / 4) * innerR, Math.sin(angle + Math.PI / 4) * innerR);
        }
        this.ctx.closePath();
        this.ctx.fill();
      } else if (p.type === 'lantern') {
        // Draw small glowing circle
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 2);
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size * 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // Petal
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    });
  }

  animate() {
    if (!this.running) return;
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }

  burst(x, y, count = 20) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 2,
        life: 1,
        maxLife: 1,
        type: 'sparkle',
        opacity: 0.8,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        color: `hsl(${40 + Math.random() * 20}, 100%, ${60 + Math.random() * 30}%)`,
      });
    }
  }
}

// Floating decorations
function createFloatingDecorations() {
  const container = document.getElementById('floating-decorations');
  const items = ['🏮', '🐴', '🧧', '✨', '🌸', '🎆', '💰', '🐎', '🍊', '🎊'];

  for (let i = 0; i < 12; i++) {
    const el = document.createElement('div');
    el.className = 'floating-item';
    el.textContent = items[Math.floor(Math.random() * items.length)];
    el.style.left = `${Math.random() * 100}%`;
    el.style.animationDuration = `${15 + Math.random() * 20}s`;
    el.style.animationDelay = `${Math.random() * 15}s`;
    el.style.fontSize = `${1.5 + Math.random() * 1.5}rem`;
    container.appendChild(el);
  }
}

// Initialize
const particleSystem = new ParticleSystem('particles-canvas');
createFloatingDecorations();
