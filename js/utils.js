/**
 * CodeBlock – Utility functions
 */

const Utils = {
  log(msg, type = 'log') {
    const consoleEl = document.getElementById('console');
    if (!consoleEl) return;
    const line = document.createElement('div');
    line.className = type;
    const time = new Date().toLocaleTimeString();
    line.textContent = `[${time}] ${msg}`;
    consoleEl.appendChild(line);
    consoleEl.scrollTop = consoleEl.scrollHeight;
  },

  clearConsole() {
    const consoleEl = document.getElementById('console');
    if (consoleEl) consoleEl.innerHTML = '';
  },

  downloadFile(filename, content, mime = 'application/json') {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9);
  },

  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  degToRad(deg) {
    return deg * Math.PI / 180;
  },

  radToDeg(rad) {
    return rad * 180 / Math.PI;
  },

  // Simple color helper
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
};

// Make available globally
window.Utils = Utils;
