/**
 * CodeBlock – Runtime / Stage Engine
 */

class Sprite {
  constructor(runtime) {
    this.runtime = runtime;
    this.x = 0;
    this.y = 0;
    this.direction = 90; // Scratch-style: 90 = right
    this.size = 100;
    this.visible = true;
    this.color = '#4f8cff';
    this.sayText = null;
    this.sayUntil = 0;
  }

  moveSteps(steps) {
    const rad = Utils.degToRad(this.direction - 90); // convert to canvas coords
    this.x += Math.cos(rad) * steps;
    this.y += Math.sin(rad) * steps;
  }

  turn(degrees) {
    this.direction = (this.direction + degrees) % 360;
    if (this.direction < 0) this.direction += 360;
  }

  goto(x, y) {
    this.x = x;
    this.y = y;
  }

  say(text) {
    this.sayText = String(text);
    this.sayUntil = Infinity;
  }

  async sayFor(text, seconds) {
    this.sayText = String(text);
    this.sayUntil = this.runtime.timer + seconds;
    await this.runtime.wait(seconds);
    if (this.sayUntil <= this.runtime.timer) this.sayText = null;
  }

  isTouchingEdge() {
    const halfW = 20 * (this.size / 100);
    const halfH = 20 * (this.size / 100);
    return (
      this.x - halfW < -240 ||
      this.x + halfW > 240 ||
      this.y - halfH < -180 ||
      this.y + halfH > 180
    );
  }

  draw(ctx) {
    if (!this.visible) return;

    ctx.save();
    // Stage center is (240, 180) in canvas coords, y is flipped
    const canvasX = 240 + this.x;
    const canvasY = 180 - this.y;

    ctx.translate(canvasX, canvasY);
    ctx.rotate(Utils.degToRad(this.direction - 90));
    const scale = this.size / 100;
    ctx.scale(scale, scale);

    // Simple triangle sprite (pointing right)
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(-15, 12);
    ctx.lineTo(-10, 0);
    ctx.lineTo(-15, -12);
    ctx.closePath();
    ctx.fill();

    // Outline
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5 / scale;
    ctx.stroke();

    ctx.restore();

    // Speech bubble
    if (this.sayText) {
      ctx.save();
      ctx.font = '14px Segoe UI, sans-serif';
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      const metrics = ctx.measureText(this.sayText);
      const bw = metrics.width + 16;
      const bh = 28;
      const bx = canvasX - bw / 2;
      const by = canvasY - 40 - bh;

      // Bubble
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 8);
      ctx.fill();
      ctx.stroke();

      // Text
      ctx.fillStyle = '#111';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.sayText, canvasX, by + bh / 2);
      ctx.restore();

      if (this.sayUntil < Infinity && this.runtime.timer >= this.sayUntil) {
        this.sayText = null;
      }
    }
  }
}

class Runtime {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.sprite = new Sprite(this);
    this.running = false;
    this.startTime = 0;
    this.timer = 0;
    this.keys = new Set();
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseDown = false;
    this.scripts = [];
    this.animationId = null;
    this.lastFrame = 0;
    this.fps = 0;

    this._bindEvents();
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
        if (!this.running || this.timer - start >= seconds) {
          resolve();
        } else {
          requestAnimationFrame(check);
        }
      };
      check();
    });
  }

  yieldFrame() {
    return new Promise(resolve => requestAnimationFrame(resolve));
  }

  broadcast(msg) {
    // Simple broadcast – can be extended later
    Utils.log(`Broadcast: ${msg}`, 'info');
  }

  async start(scripts) {
    if (this.running) this.stop();
    this.running = true;
    this.resetTimer();
    this.scripts = scripts || [];

    // Reset sprite
    this.sprite.x = 0;
    this.sprite.y = 0;
    this.sprite.direction = 90;
    this.sprite.size = 100;
    this.sprite.visible = true;
    this.sprite.color = '#4f8cff';
    this.sprite.sayText = null;

    Utils.log('Project started', 'success');

    // Run all flag scripts in parallel
    const promises = this.scripts.map(fn => {
      try {
        return fn(this.sprite, this);
      } catch (err) {
        Utils.log('Script error: ' + err.message, 'error');
        return Promise.resolve();
      }
    });

    this._loop();

    await Promise.all(promises);
    if (this.running) {
      // Scripts finished naturally
    }
  }

  stop() {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    Utils.log('Project stopped', 'warn');
  }

  _loop() {
    if (!this.running) return;

    const now = performance.now();
    this.timer = (now - this.startTime) / 1000;

    if (now - this.lastFrame >= 16) { // ~60fps
      this.fps = Math.round(1000 / (now - this.lastFrame));
      this.lastFrame = now;
      this._render();
    }

    this.animationId = requestAnimationFrame(() => this._loop());
  }

  _render() {
    const ctx = this.ctx;
    // Clear
    ctx.fillStyle = '#1a1e28';
    ctx.fillRect(0, 0, 480, 360);

    // Grid (subtle)
    ctx.strokeStyle = '#252a35';
    ctx.lineWidth = 1;
    for (let x = 0; x <= 480; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 360);
      ctx.stroke();
    }
    for (let y = 0; y <= 360; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(480, y);
      ctx.stroke();
    }

    // Center crosshair
    ctx.strokeStyle = '#3a4558';
    ctx.beginPath();
    ctx.moveTo(240, 0);
    ctx.lineTo(240, 360);
    ctx.moveTo(0, 180);
    ctx.lineTo(480, 180);
    ctx.stroke();

    // Draw sprite
    this.sprite.draw(ctx);

    // Update UI
    const fpsEl = document.getElementById('fps');
    const spriteEl = document.getElementById('sprite-count');
    if (fpsEl) fpsEl.textContent = `FPS: ${this.fps}`;
    if (spriteEl) spriteEl.textContent = `Sprites: 1`;
  }
}

window.Runtime = Runtime;
window.Sprite = Sprite;
