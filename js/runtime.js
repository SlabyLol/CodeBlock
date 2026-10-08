/**
 * CodeBlock – Runtime Engine (multi-sprite)
 */

class Runtime {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.project = null;
    this.running = false;
    this.startTime = 0;
    this.timer = 0;
    this.keys = new Set();
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseDown = false;
    this.animationId = null;
    this.lastFrame = 0;
    this.fps = 0;
    this.vars = {};

    this._bindEvents();
  }

  setProject(project) {
    this.project = project;
    // Link sprites to this runtime
    for (const s of project.sprites) {
      s.runtime = this;
    }
  }

  _bindEvents() {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key);
      if (e.key === ' ') this.keys.add('space');
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key);
      if (e.key === ' ') this.keys.delete('space');
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const cx = (e.clientX - rect.left) * scaleX;
      const cy = (e.clientY - rect.top) * scaleY;
      this.mouseX = cx - 240;
      this.mouseY = 180 - cy;
    });

    this.canvas.addEventListener('mousedown', () => { this.mouseDown = true; });
    this.canvas.addEventListener('mouseup', () => { this.mouseDown = false; });
    this.canvas.addEventListener('mouseleave', () => { this.mouseDown = false; });
  }

  isKeyPressed(key) {
    return this.keys.has(key);
  }

  random(from, to) {
    return Math.floor(Math.random() * (to - from + 1)) + from;
  }

  resetTimer() {
    this.startTime = performance.now();
    this.timer = 0;
  }

  wait(seconds) {
    return new Promise(resolve => {
      const start = this.timer;
      const check = () => {
        if (!this.running || this.timer - start >= seconds) resolve();
        else requestAnimationFrame(check);
      };
      check();
    });
  }

  yieldFrame() {
    return new Promise(resolve => requestAnimationFrame(resolve));
  }

  broadcast(msg) {
    Utils.log('Broadcast: ' + msg, 'info');
  }

  /**
   * Start all scripts for all sprites.
   * scriptsMap: { spriteId: [fn, fn, ...] }
   */
  async start(scriptsMap) {
    if (this.running) this.stop();
    this.running = true;
    this.resetTimer();
    this.vars = Object.assign({}, this.project ? this.project.variables : {});

    // Reset sprite states (keep costumes & positions from editor)
    if (this.project) {
      for (const s of this.project.sprites) {
        s.sayText = null;
        s.runtime = this;
      }
    }

    Utils.log('Project started', 'success');
    document.getElementById('running-state').textContent = 'Running';

    const promises = [];
    for (const spriteId of Object.keys(scriptsMap || {})) {
      const sprite = this.project.sprites.find(s => s.id === spriteId);
      if (!sprite) continue;
      for (const fn of scriptsMap[spriteId]) {
        promises.push(
          Promise.resolve().then(() => fn(sprite, this)).catch(err => {
            Utils.log(`[${sprite.name}] ${err.message}`, 'error');
          })
        );
      }
    }

    this._loop();
    await Promise.all(promises);
  }

  stop() {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    Utils.log('Project stopped', 'warn');
    const el = document.getElementById('running-state');
    if (el) el.textContent = 'Stopped';
  }

  _loop() {
    if (!this.running) return;
    const now = performance.now();
    this.timer = (now - this.startTime) / 1000;

    if (now - this.lastFrame >= 16) {
      this.fps = Math.round(1000 / (now - this.lastFrame || 16));
      this.lastFrame = now;
      this._render();
    }
    this.animationId = requestAnimationFrame(() => this._loop());
  }

  _render() {
    const ctx = this.ctx;
    ctx.fillStyle = this.project ? this.project.stageBackdrop : '#11151c';
    ctx.fillRect(0, 0, 480, 360);

    // Subtle grid
    ctx.strokeStyle = '#1c2230';
    ctx.lineWidth = 1;
    for (let x = 0; x <= 480; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 360); ctx.stroke();
    }
    for (let y = 0; y <= 360; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(480, y); ctx.stroke();
    }

    // Center lines
    ctx.strokeStyle = '#2a3344';
    ctx.beginPath();
    ctx.moveTo(240, 0); ctx.lineTo(240, 360);
    ctx.moveTo(0, 180); ctx.lineTo(480, 180);
    ctx.stroke();

    if (this.project) {
      for (const sprite of this.project.sprites) {
        sprite.draw(ctx);
      }
    }

    // UI
    const fpsEl = document.getElementById('fps');
    const countEl = document.getElementById('sprite-count');
    if (fpsEl) fpsEl.textContent = 'FPS: ' + this.fps;
    if (countEl) countEl.textContent = 'Sprites: ' + (this.project ? this.project.sprites.length : 0);
  }

  // Also render when not running (editor preview)
  renderPreview() {
    this._render();
  }
}

window.Runtime = Runtime;
