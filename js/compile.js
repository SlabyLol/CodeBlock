/**
 * CodeBlock – Compiler
 * Turns Blockly workspace into executable JavaScript functions
 */

const Compiler = {
  /**
   * Compile the entire workspace into an array of runnable script functions.
   * Only top-level "when flag clicked" (and similar hat blocks) are turned into scripts.
   */
  compile(workspace) {
    const topBlocks = workspace.getTopBlocks(false);
    const scripts = [];

    for (const block of topBlocks) {
      if (block.type === 'events_when_flag') {
        const code = this._generateScript(block);
        if (code) {
          try {
            // Create an async function that receives (sprite, runtime)
            const fn = new Function('sprite', 'runtime',
              `return (async () => {\n${code}\n})();`
            );
            scripts.push(fn);
          } catch (err) {
            Utils.log('Compile error: ' + err.message, 'error');
          }
        }
      }
      // Future: events_when_key, events_when_clicked, etc.
    }

    return scripts;
  },

  /**
   * Generate JS code for a single hat block and its attached stack.
   */
  _generateScript(hatBlock) {
    // Get the first block after the hat
    let code = '';
    let current = hatBlock.getNextBlock();

    // We walk the chain manually so we have full control
    while (current) {
      const blockCode = javascript.javascriptGenerator.blockToCode(current);
      if (typeof blockCode === 'string') {
        code += blockCode;
      } else if (Array.isArray(blockCode)) {
        // value blocks – ignore at statement level
      }
      current = current.getNextBlock();
    }

    // Also generate any statements that are directly connected via input
    // (for blocks that have statement inputs)
    // The default generator already handles most of this when we call blockToCode on the stack.

    // Better approach: use the official generator on the whole stack
    // Reset and generate properly
    javascript.javascriptGenerator.init(hatBlock.workspace);

    // Collect all blocks after the hat
    const stack = [];
    let b = hatBlock.getNextBlock();
    while (b) {
      stack.push(b);
      b = b.getNextBlock();
    }

    let fullCode = '';
    for (const blk of stack) {
      fullCode += javascript.javascriptGenerator.blockToCode(blk);
    }

    // Finish generator (variables etc.)
    fullCode = javascript.javascriptGenerator.finish(fullCode);

    // Clean up the finish() preamble a bit
    fullCode = fullCode.replace(/^var .*?;\n/gm, (match) => {
      // Keep variable declarations
      return match;
    });

    return fullCode;
  },

  /**
   * Generate a full standalone HTML game from the current workspace.
   */
  compileToHTML(workspace, projectName = 'My Game') {
    const scripts = this.compile(workspace);
    // We don't serialize the functions themselves; we generate the source again
    // for a clean export.

    javascript.javascriptGenerator.init(workspace);
    let code = '';
    const topBlocks = workspace.getTopBlocks(false);
    for (const block of topBlocks) {
      if (block.type === 'events_when_flag') {
        let b = block.getNextBlock();
        while (b) {
          code += javascript.javascriptGenerator.blockToCode(b);
          b = b.getNextBlock();
        }
      }
    }
    code = javascript.javascriptGenerator.finish(code);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${projectName}</title>
  <style>
    body { margin: 0; background: #111; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui, sans-serif; }
    canvas { background: #1a1e28; box-shadow: 0 0 40px rgba(0,0,0,0.6); border-radius: 8px; }
  </style>
</head>
<body>
  <canvas id="stage" width="480" height="360"></canvas>
  <script>
${this._getRuntimeSource()}

// Generated game code
const canvas = document.getElementById('stage');
const runtime = new Runtime(canvas);
const sprite = runtime.sprite;

async function main() {
${code}
}

runtime.start([() => main()]);
  </script>
</body>
</html>`;
    return html;
  },

  _getRuntimeSource() {
    // Minimal embedded runtime for exported games
    return `
class Sprite {
  constructor(runtime) {
    this.runtime = runtime;
    this.x = 0; this.y = 0; this.direction = 90;
    this.size = 100; this.visible = true; this.color = '#4f8cff';
    this.sayText = null; this.sayUntil = 0;
  }
  moveSteps(steps) {
    const rad = (this.direction - 90) * Math.PI / 180;
    this.x += Math.cos(rad) * steps;
    this.y += Math.sin(rad) * steps;
  }
  turn(d) { this.direction = (this.direction + d) % 360; if (this.direction < 0) this.direction += 360; }
  goto(x, y) { this.x = x; this.y = y; }
  say(t) { this.sayText = String(t); this.sayUntil = Infinity; }
  async sayFor(t, s) { this.sayText = String(t); this.sayUntil = this.runtime.timer + s; await this.runtime.wait(s); if (this.sayUntil <= this.runtime.timer) this.sayText = null; }
  isTouchingEdge() {
    const h = 20 * (this.size / 100);
    return this.x - h < -240 || this.x + h > 240 || this.y - h < -180 || this.y + h > 180;
  }
  draw(ctx) {
    if (!this.visible) return;
    ctx.save();
    const cx = 240 + this.x, cy = 180 - this.y;
    ctx.translate(cx, cy);
    ctx.rotate((this.direction - 90) * Math.PI / 180);
    const s = this.size / 100; ctx.scale(s, s);
    ctx.fillStyle = this.color;
    ctx.beginPath(); ctx.moveTo(20,0); ctx.lineTo(-15,12); ctx.lineTo(-10,0); ctx.lineTo(-15,-12); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5 / s; ctx.stroke();
    ctx.restore();
    if (this.sayText) {
      ctx.font = '14px sans-serif'; ctx.fillStyle = '#fff';
      const m = ctx.measureText(this.sayText); const bw = m.width + 16, bh = 28;
      const bx = cx - bw/2, by = cy - 40 - bh;
      ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 8); ctx.fill();
      ctx.fillStyle = '#111'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(this.sayText, cx, by + bh/2);
      if (this.sayUntil < Infinity && this.runtime.timer >= this.sayUntil) this.sayText = null;
    }
  }
}
class Runtime {
  constructor(canvas) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d');
    this.sprite = new Sprite(this); this.running = false;
    this.startTime = 0; this.timer = 0; this.keys = new Set();
    this.mouseX = 0; this.mouseY = 0; this.mouseDown = false;
    this.animationId = null; this.lastFrame = 0;
    window.addEventListener('keydown', e => { this.keys.add(e.key); if (e.key===' ') this.keys.add('space'); });
    window.addEventListener('keyup', e => { this.keys.delete(e.key); if (e.key===' ') this.keys.delete('space'); });
    canvas.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      const cx = (e.clientX - r.left) * (480 / r.width);
      const cy = (e.clientY - r.top) * (360 / r.height);
      this.mouseX = cx - 240; this.mouseY = 180 - cy;
    });
    canvas.addEventListener('mousedown', () => this.mouseDown = true);
    canvas.addEventListener('mouseup', () => this.mouseDown = false);
  }
  isKeyPressed(k) { return this.keys.has(k); }
  random(a,b) { return Math.floor(Math.random()*(b-a+1))+a; }
  resetTimer() { this.startTime = performance.now(); this.timer = 0; }
  wait(s) { return new Promise(r => { const t0 = this.timer; const c = () => { if (!this.running || this.timer-t0>=s) r(); else requestAnimationFrame(c); }; c(); }); }
  yieldFrame() { return new Promise(r => requestAnimationFrame(r)); }
  broadcast(m) { console.log('Broadcast:', m); }
  async start(scripts) {
    this.running = true; this.resetTimer();
    this.sprite.x=0; this.sprite.y=0; this.sprite.direction=90; this.sprite.size=100; this.sprite.visible=true;
    this._loop();
    await Promise.all(scripts.map(fn => fn(this.sprite, this).catch(e => console.error(e))));
  }
  stop() { this.running = false; if (this.animationId) cancelAnimationFrame(this.animationId); }
  _loop() {
    if (!this.running) return;
    const now = performance.now(); this.timer = (now - this.startTime)/1000;
    if (now - this.lastFrame >= 16) { this.lastFrame = now; this._render(); }
    this.animationId = requestAnimationFrame(() => this._loop());
  }
  _render() {
    const ctx = this.ctx;
    ctx.fillStyle = '#1a1e28'; ctx.fillRect(0,0,480,360);
    this.sprite.draw(ctx);
  }
}
`;
  }
};

window.Compiler = Compiler;
