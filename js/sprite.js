/**
 * CodeBlock – Sprite System
 * Supports multiple costumes, custom drawings, properties
 */

class Costume {
  constructor(name = 'costume1', width = 64, height = 64) {
    this.id = Utils.generateId();
    this.name = name;
    this.width = width;
    this.height = height;
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
    // Default: simple triangle shape
    this._drawDefault();
  }

  _drawDefault() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = '#4f8cff';
    ctx.beginPath();
    const cx = this.width / 2, cy = this.height / 2;
    ctx.moveTo(cx + 22, cy);
    ctx.lineTo(cx - 16, cy + 14);
    ctx.lineTo(cx - 10, cy);
    ctx.lineTo(cx - 16, cy - 14);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  fromImageData(imageData) {
    this.ctx.putImageData(imageData, 0, 0);
  }

  toDataURL() {
    return this.canvas.toDataURL('image/png');
  }

  clone() {
    const c = new Costume(this.name + '_copy', this.width, this.height);
    c.ctx.drawImage(this.canvas, 0, 0);
    return c;
  }
}

class Sprite {
  constructor(name = 'Sprite1', runtime = null) {
    this.id = Utils.generateId();
    this.name = name;
    this.runtime = runtime;

    this.x = 0;
    this.y = 0;
    this.direction = 90;
    this.size = 100;
    this.visible = true;
    this.rotationStyle = 'all-around'; // all-around | left-right | don't rotate

    this.costumes = [new Costume('costume1')];
    this.currentCostume = 0;

    this.sayText = null;
    this.sayUntil = 0;
    this.bubbleType = 'say'; // say | think

    // Scripts for this sprite (CBS source + compiled)
    this.cbsSource = '';
    this.blockWorkspace = null; // serialized later
  }

  get costume() {
    return this.costumes[this.currentCostume] || this.costumes[0];
  }

  addCostume(costume) {
    this.costumes.push(costume);
    this.currentCostume = this.costumes.length - 1;
    return costume;
  }

  switchCostume(indexOrName) {
    if (typeof indexOrName === 'number') {
      this.currentCostume = Utils.clamp(indexOrName, 0, this.costumes.length - 1);
    } else {
      const idx = this.costumes.findIndex(c => c.name === indexOrName);
      if (idx >= 0) this.currentCostume = idx;
    }
  }

  nextCostume() {
    this.currentCostume = (this.currentCostume + 1) % this.costumes.length;
  }

  // ===== Motion =====
  moveSteps(steps) {
    const rad = Utils.degToRad(this.direction - 90);
    this.x += Math.cos(rad) * steps;
    this.y += Math.sin(rad) * steps;
  }

  turn(degrees) {
    this.direction = (this.direction + degrees) % 360;
    if (this.direction < 0) this.direction += 360;
  }

  pointInDirection(dir) {
    this.direction = ((dir % 360) + 360) % 360;
  }

  goto(x, y) {
    this.x = x;
    this.y = y;
  }

  gotoSprite(other) {
    if (other) {
      this.x = other.x;
      this.y = other.y;
    }
  }

  // ===== Looks =====
  say(text) {
    this.sayText = String(text);
    this.sayUntil = Infinity;
    this.bubbleType = 'say';
  }

  async sayFor(text, seconds) {
    this.sayText = String(text);
    this.sayUntil = (this.runtime ? this.runtime.timer : 0) + seconds;
    this.bubbleType = 'say';
    if (this.runtime) await this.runtime.wait(seconds);
    if (this.sayUntil <= (this.runtime ? this.runtime.timer : 0)) this.sayText = null;
  }

  think(text) {
    this.sayText = String(text);
    this.sayUntil = Infinity;
    this.bubbleType = 'think';
  }

  // ===== Sensing =====
  isTouchingEdge() {
    const half = 20 * (this.size / 100);
    return (
      this.x - half < -240 || this.x + half > 240 ||
      this.y - half < -180 || this.y + half > 180
    );
  }

  distanceTo(other) {
    if (!other) return 0;
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // ===== Render =====
  draw(ctx) {
    if (!this.visible) return;

    const canvasX = 240 + this.x;
    const canvasY = 180 - this.y;
    const scale = this.size / 100;
    const costume = this.costume;

    ctx.save();
    ctx.translate(canvasX, canvasY);

    if (this.rotationStyle === 'all-around') {
      ctx.rotate(Utils.degToRad(this.direction - 90));
    } else if (this.rotationStyle === 'left-right') {
      if (this.direction > 90 && this.direction < 270) {
        ctx.scale(-1, 1);
      }
    }

    ctx.scale(scale, scale);
    ctx.drawImage(
      costume.canvas,
      -costume.width / 2,
      -costume.height / 2
    );
    ctx.restore();

    // Speech / think bubble
    if (this.sayText) {
      this._drawBubble(ctx, canvasX, canvasY);
      if (this.sayUntil < Infinity && this.runtime && this.runtime.timer >= this.sayUntil) {
        this.sayText = null;
      }
    }
  }

  _drawBubble(ctx, cx, cy) {
    ctx.save();
    ctx.font = '13px Segoe UI, sans-serif';
    const metrics = ctx.measureText(this.sayText);
    const bw = Math.max(metrics.width + 16, 40);
    const bh = 26;
    const bx = cx - bw / 2;
    const by = cy - 36 - bh;

    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;

    if (this.bubbleType === 'think') {
      // Cloud-like
      ctx.beginPath();
      ctx.ellipse(cx, by + bh / 2, bw / 2, bh / 2, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      // small bubbles
      ctx.beginPath();
      ctx.arc(cx - 8, by + bh + 4, 4, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx - 14, by + bh + 10, 2.5, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 6);
      ctx.fill(); ctx.stroke();
      // tail
      ctx.beginPath();
      ctx.moveTo(cx - 4, by + bh);
      ctx.lineTo(cx, by + bh + 8);
      ctx.lineTo(cx + 6, by + bh);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = '#111';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.sayText, cx, by + bh / 2);
    ctx.restore();
  }

  // Thumbnail for sprite list
  drawThumbnail(targetCanvas) {
    const tctx = targetCanvas.getContext('2d');
    tctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
    const costume = this.costume;
    const scale = Math.min(
      targetCanvas.width / costume.width,
      targetCanvas.height / costume.height
    ) * 0.85;
    const w = costume.width * scale;
    const h = costume.height * scale;
    tctx.drawImage(
      costume.canvas,
      (targetCanvas.width - w) / 2,
      (targetCanvas.height - h) / 2,
      w, h
    );
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      x: this.x,
      y: this.y,
      direction: this.direction,
      size: this.size,
      visible: this.visible,
      currentCostume: this.currentCostume,
      cbsSource: this.cbsSource,
      costumes: this.costumes.map(c => ({
        id: c.id,
        name: c.name,
        width: c.width,
        height: c.height,
        dataURL: c.toDataURL()
      }))
    };
  }

  static deserialize(data, runtime) {
    const s = new Sprite(data.name, runtime);
    s.id = data.id || s.id;
    s.x = data.x || 0;
    s.y = data.y || 0;
    s.direction = data.direction ?? 90;
    s.size = data.size ?? 100;
    s.visible = data.visible !== false;
    s.cbsSource = data.cbsSource || '';
    s.costumes = [];
    if (data.costumes && data.costumes.length) {
      for (const cd of data.costumes) {
        const c = new Costume(cd.name, cd.width || 64, cd.height || 64);
        c.id = cd.id || c.id;
        if (cd.dataURL) {
          const img = new Image();
          img.src = cd.dataURL;
          // Note: async load – for simplicity we draw when loaded
          img.onload = () => {
            c.ctx.clearRect(0, 0, c.width, c.height);
            c.ctx.drawImage(img, 0, 0);
          };
        }
        s.costumes.push(c);
      }
    } else {
      s.costumes = [new Costume('costume1')];
    }
    s.currentCostume = data.currentCostume || 0;
    return s;
  }
}

window.Sprite = Sprite;
window.Costume = Costume;
