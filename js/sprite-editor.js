/**
 * CodeBlock – Sprite Drawing Editor
 */

const SpriteEditor = {
  canvas: null,
  ctx: null,
  preview: null,
  previewCtx: null,
  tool: 'pencil',
  color: '#4f8cff',
  brushSize: 3,
  drawing: false,
  startX: 0,
  startY: 0,
  imageDataBackup: null,

  init() {
    this.canvas = document.getElementById('draw-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.preview = document.getElementById('preview-canvas');
    this.previewCtx = this.preview.getContext('2d');

    // Fill with transparent-ish dark
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this._bindTools();
    this._bindCanvas();
    this._updatePreview();
  },

  _bindTools() {
    document.querySelectorAll('.tool').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tool').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.tool = btn.dataset.tool;
      });
    });

    document.getElementById('draw-color').addEventListener('input', e => {
      this.color = e.target.value;
    });

    document.getElementById('brush-size').addEventListener('input', e => {
      this.brushSize = parseInt(e.target.value, 10);
    });

    document.getElementById('btn-clear-canvas').addEventListener('click', () => {
      this.ctx.fillStyle = '#1a1a1a';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this._updatePreview();
    });

    document.getElementById('btn-apply-costume').addEventListener('click', () => {
      this.applyToSelectedSprite();
    });
  },

  _bindCanvas() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      return {
        x: Math.floor((e.clientX - rect.left) * scaleX),
        y: Math.floor((e.clientY - rect.top) * scaleY)
      };
    };

    this.canvas.addEventListener('mousedown', (e) => {
      const pos = getPos(e);
      this.drawing = true;
      this.startX = pos.x;
      this.startY = pos.y;
      this.imageDataBackup = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

      if (this.tool === 'pencil' || this.tool === 'eraser') {
        this._paint(pos.x, pos.y);
      } else if (this.tool === 'fill') {
        this._floodFill(pos.x, pos.y);
      } else if (this.tool === 'picker') {
        const pixel = this.ctx.getImageData(pos.x, pos.y, 1, 1).data;
        const hex = '#' + [pixel[0], pixel[1], pixel[2]].map(c => c.toString(16).padStart(2, '0')).join('');
        this.color = hex;
        document.getElementById('draw-color').value = hex;
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.drawing) return;
      const pos = getPos(e);

      if (this.tool === 'pencil' || this.tool === 'eraser') {
        this._paint(pos.x, pos.y);
      } else if (['line', 'rect', 'circle'].includes(this.tool)) {
        this.ctx.putImageData(this.imageDataBackup, 0, 0);
        this._drawShape(this.startX, this.startY, pos.x, pos.y);
      }
    });

    const stop = () => {
      if (this.drawing) {
        this.drawing = false;
        this._updatePreview();
      }
    };
    this.canvas.addEventListener('mouseup', stop);
    this.canvas.addEventListener('mouseleave', stop);
  },

  _paint(x, y) {
    this.ctx.fillStyle = this.tool === 'eraser' ? '#1a1a1a' : this.color;
    const s = this.brushSize;
    this.ctx.fillRect(x - Math.floor(s / 2), y - Math.floor(s / 2), s, s);
  },

  _drawShape(x1, y1, x2, y2) {
    this.ctx.strokeStyle = this.color;
    this.ctx.fillStyle = this.color;
    this.ctx.lineWidth = this.brushSize;
    this.ctx.lineCap = 'round';

    if (this.tool === 'line') {
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    } else if (this.tool === 'rect') {
      this.ctx.strokeRect(
        Math.min(x1, x2), Math.min(y1, y2),
        Math.abs(x2 - x1), Math.abs(y2 - y1)
      );
    } else if (this.tool === 'circle') {
      const rx = Math.abs(x2 - x1) / 2;
      const ry = Math.abs(y2 - y1) / 2;
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  },

  _floodFill(startX, startY) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const imageData = this.ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const target = this._getPixel(data, startX, startY, w);
    const fill = this._hexToRgba(this.color);

    if (this._sameColor(target, fill)) return;

    const stack = [[startX, startY]];
    const visited = new Uint8Array(w * h);

    while (stack.length) {
      const [x, y] = stack.pop();
      if (x < 0 || x >= w || y < 0 || y >= h) continue;
      const idx = y * w + x;
      if (visited[idx]) continue;
      visited[idx] = 1;

      const pixel = this._getPixel(data, x, y, w);
      if (!this._sameColor(pixel, target)) continue;

      this._setPixel(data, x, y, w, fill);
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    this.ctx.putImageData(imageData, 0, 0);
  },

  _getPixel(data, x, y, w) {
    const i = (y * w + x) * 4;
    return [data[i], data[i + 1], data[i + 2], data[i + 3]];
  },

  _setPixel(data, x, y, w, rgba) {
    const i = (y * w + x) * 4;
    data[i] = rgba[0]; data[i + 1] = rgba[1]; data[i + 2] = rgba[2]; data[i + 3] = rgba[3];
  },

  _sameColor(a, b) {
    return Math.abs(a[0] - b[0]) < 5 && Math.abs(a[1] - b[1]) < 5 &&
           Math.abs(a[2] - b[2]) < 5 && Math.abs(a[3] - b[3]) < 5;
  },

  _hexToRgba(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b, 255];
  },

  _updatePreview() {
    this.previewCtx.clearRect(0, 0, this.preview.width, this.preview.height);
    this.previewCtx.drawImage(
      this.canvas, 0, 0, this.canvas.width, this.canvas.height,
      0, 0, this.preview.width, this.preview.height
    );
  },

  loadFromCostume(costume) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    // Scale costume into draw canvas
    this.ctx.drawImage(
      costume.canvas,
      0, 0, costume.width, costume.height,
      0, 0, this.canvas.width, this.canvas.height
    );
    this._updatePreview();
  },

  applyToSelectedSprite() {
    if (!window.App || !window.App.project) return;
    const sprite = window.App.project.selectedSprite;
    if (!sprite) {
      Utils.log('No sprite selected', 'warn');
      return;
    }
    const costume = sprite.costume;
    // Resize costume canvas if needed and copy
    costume.ctx.clearRect(0, 0, costume.width, costume.height);
    costume.ctx.drawImage(
      this.canvas,
      0, 0, this.canvas.width, this.canvas.height,
      0, 0, costume.width, costume.height
    );
    Utils.log(`Costume applied to ${sprite.name}`, 'success');
    if (window.App.refreshSpriteList) window.App.refreshSpriteList();
  }
};

window.SpriteEditor = SpriteEditor;
