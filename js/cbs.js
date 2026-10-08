/**
 * CodeBlock Script (CBS)
 * A simple Scratch-like text language that compiles to the same runtime.
 *
 * Example:
 *   when flag clicked
 *     forever
 *       move 5 steps
 *       turn right 15 degrees
 *       if key space pressed then
 *         say Jump! for 1 seconds
 *       end
 *     end
 */

const CBS = {
  /**
   * Compile CBS source into an async function (sprite, runtime) => {...}
   */
  compile(source) {
    const lines = source
      .split('\n')
      .map(l => l.replace(/\t/g, '  '))
      .filter(l => l.trim() && !l.trim().startsWith('//'));

    if (lines.length === 0) return null;

    // Find hat blocks
    const scripts = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trim().toLowerCase();
      if (line.startsWith('when flag clicked') || line === 'when flag clicked') {
        const { code, next } = this._parseBlock(lines, i + 1, 0);
        scripts.push(code);
        i = next;
      } else {
        i++;
      }
    }

    if (scripts.length === 0) {
      // Treat whole file as one script without hat
      const { code } = this._parseBlock(lines, 0, 0);
      scripts.push(code);
    }

    return scripts.map(body => {
      try {
        return new Function('sprite', 'runtime',
          `return (async () => {\n${body}\n})();`
        );
      } catch (err) {
        Utils.log('CBS compile error: ' + err.message, 'error');
        return null;
      }
    }).filter(Boolean);
  },

  _indentLevel(line) {
    const m = line.match(/^(\s*)/);
    return m ? Math.floor(m[1].length / 2) : 0;
  },

  _parseBlock(lines, start, baseIndent) {
    let code = '';
    let i = start;

    while (i < lines.length) {
      const raw = lines[i];
      const indent = this._indentLevel(raw);
      if (indent < baseIndent) break;

      const line = raw.trim();
      const lower = line.toLowerCase();

      // Control structures
      if (lower.startsWith('forever')) {
        const { code: body, next } = this._parseBlock(lines, i + 1, indent + 1);
        code += `while (runtime.running) {\n${body}  await runtime.yieldFrame();\n}\n`;
        i = next;
        continue;
      }

      if (lower.startsWith('repeat ')) {
        const times = lower.replace('repeat', '').replace('times', '').trim() || '10';
        const { code: body, next } = this._parseBlock(lines, i + 1, indent + 1);
        code += `for (let __i = 0; __i < (${times}); __i++) {\n${body}}\n`;
        i = next;
        continue;
      }

      if (lower.startsWith('if ') && lower.includes(' then')) {
        const cond = this._parseCondition(line.slice(3, line.toLowerCase().lastIndexOf('then')).trim());
        const { code: body, next } = this._parseBlock(lines, i + 1, indent + 1);
        // Check for else
        let elseBody = '';
        if (next < lines.length && lines[next].trim().toLowerCase() === 'else') {
          const res = this._parseBlock(lines, next + 1, indent + 1);
          elseBody = res.code;
          i = res.next;
        } else {
          i = next;
        }
        if (elseBody) {
          code += `if (${cond}) {\n${body}} else {\n${elseBody}}\n`;
        } else {
          code += `if (${cond}) {\n${body}}\n`;
        }
        continue;
      }

      if (lower === 'end' || lower === 'else') {
        // end of block
        break;
      }

      // Statements
      const stmt = this._parseStatement(line);
      if (stmt) code += stmt + '\n';
      i++;
    }

    return { code, next: i };
  },

  _parseStatement(line) {
    const lower = line.toLowerCase().trim();

    // move N steps
    let m = lower.match(/^move\s+(.+?)\s+steps?$/);
    if (m) return `sprite.moveSteps(${this._expr(m[1])});`;

    // turn right/left N degrees
    m = lower.match(/^turn\s+(right|left)\s+(.+?)\s+degrees?$/);
    if (m) {
      const sign = m[1] === 'left' ? '-' : '';
      return `sprite.turn(${sign}${this._expr(m[2])});`;
    }

    // go to x: N y: M
    m = lower.match(/^go\s+to\s+x:?\s*(.+?)\s+y:?\s*(.+)$/);
    if (m) return `sprite.goto(${this._expr(m[1])}, ${this._expr(m[2])});`;

    // set x/y to N
    m = lower.match(/^set\s+x\s+to\s+(.+)$/);
    if (m) return `sprite.x = ${this._expr(m[1])};`;
    m = lower.match(/^set\s+y\s+to\s+(.+)$/);
    if (m) return `sprite.y = ${this._expr(m[1])};`;

    // change x/y by N
    m = lower.match(/^change\s+x\s+by\s+(.+)$/);
    if (m) return `sprite.x += ${this._expr(m[1])};`;
    m = lower.match(/^change\s+y\s+by\s+(.+)$/);
    if (m) return `sprite.y += ${this._expr(m[1])};`;

    // point in direction N
    m = lower.match(/^point\s+in\s+direction\s+(.+)$/);
    if (m) return `sprite.pointInDirection(${this._expr(m[1])});`;

    // say TEXT / say TEXT for N seconds
    m = lower.match(/^say\s+(.+?)\s+for\s+(.+?)\s+seconds?$/);
    if (m) return `await sprite.sayFor(${this._str(m[1])}, ${this._expr(m[2])});`;
    m = lower.match(/^say\s+(.+)$/);
    if (m) return `sprite.say(${this._str(m[1])});`;

    // show / hide
    if (lower === 'show') return `sprite.visible = true;`;
    if (lower === 'hide') return `sprite.visible = false;`;

    // set size to N
    m = lower.match(/^set\s+size\s+to\s+(.+?)\s*%?$/);
    if (m) return `sprite.size = ${this._expr(m[1])};`;

    // wait N seconds
    m = lower.match(/^wait\s+(.+?)\s+seconds?$/);
    if (m) return `await runtime.wait(${this._expr(m[1])});`;

    // next costume
    if (lower === 'next costume') return `sprite.nextCostume();`;

    // stop all
    if (lower === 'stop all' || lower === 'stop') return `runtime.stop();`;

    // set variable
    m = lower.match(/^set\s+([a-z_][a-z0-9_]*)\s+to\s+(.+)$/);
    if (m) return `runtime.vars["${m[1]}"] = ${this._expr(m[2])};`;

    // change variable
    m = lower.match(/^change\s+([a-z_][a-z0-9_]*)\s+by\s+(.+)$/);
    if (m) return `runtime.vars["${m[1]}"] = (runtime.vars["${m[1]}"] || 0) + ${this._expr(m[2])};`;

    return `/* unknown: ${line} */`;
  },

  _parseCondition(cond) {
    const lower = cond.toLowerCase();

    // key X pressed
    let m = lower.match(/^key\s+["']?(\w+)["']?\s+pressed$/);
    if (m) return `runtime.isKeyPressed("${m[1]}")`;

    // mouse down
    if (lower === 'mouse down' || lower === 'mouse down?') return `runtime.mouseDown`;

    // touching edge
    if (lower.includes('touching edge')) return `sprite.isTouchingEdge()`;

    // comparisons
    m = cond.match(/(.+?)\s*(=|!=|<>|<|>|<=|>=)\s*(.+)/);
    if (m) {
      const ops = { '=': '===', '!=': '!==', '<>': '!==', '<': '<', '>': '>', '<=': '<=', '>=': '>=' };
      return `(${this._expr(m[1])} ${ops[m[2]] || '==='} ${this._expr(m[3])})`;
    }

    return this._expr(cond);
  },

  _expr(str) {
    str = str.trim();
    // variable reference
    if (/^[a-z_][a-z0-9_]*$/i.test(str) && !['true','false'].includes(str.toLowerCase())) {
      // Could be a number or variable
      if (!isNaN(Number(str))) return str;
      return `(runtime.vars["${str}"] || 0)`;
    }
    // simple math already ok
    return str.replace(/x position/gi, 'sprite.x')
              .replace(/y position/gi, 'sprite.y')
              .replace(/direction/gi, 'sprite.direction')
              .replace(/size/gi, 'sprite.size')
              .replace(/timer/gi, 'runtime.timer');
  },

  _str(s) {
    s = s.trim();
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      return s;
    }
    return JSON.stringify(s);
  },

  format(source) {
    // Very simple auto-indent
    const lines = source.split('\n');
    let indent = 0;
    const out = [];
    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed) { out.push(''); continue; }
      if (trimmed === 'end' || trimmed === 'else') indent = Math.max(0, indent - 1);
      out.push('  '.repeat(indent) + trimmed);
      if (/^(forever|repeat |if |else)/i.test(trimmed) && !trimmed.endsWith('end')) {
        indent++;
      }
    }
    return out.join('\n');
  }
};

window.CBS = CBS;
