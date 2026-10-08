/**
 * CodeBlock v2 – Main Application
 * Blocks + CBS Script + Sprite Drawing + Multi-Sprite
 */

const App = {
  runtime: null,
  project: null,
  workspace: null,
  currentMode: 'blocks',

  init() {
    this.project = new Project();
    this.project.addSprite('Sprite1');

    const canvas = document.getElementById('stage');
    this.runtime = new Runtime(canvas);
    this.runtime.setProject(this.project);

    this.workspace = Editor.init();
    SpriteEditor.init();

    this._bindUI();
    this.refreshSpriteList();
    this.updateProperties();
    this.runtime.renderPreview();

    // Preview loop when not running
    setInterval(() => {
      if (!this.runtime.running) this.runtime.renderPreview();
    }, 100);

    Utils.log('CodeBlock v2 ready – Blocks + CBS + Draw Sprites!', 'success');
  },

  _bindUI() {
    // Toolbar
    document.getElementById('btn-new').addEventListener('click', () => this.onNew());
    document.getElementById('btn-load').addEventListener('click', () => document.getElementById('file-input').click());
    document.getElementById('btn-save').addEventListener('click', () => this.onSave());
    document.getElementById('btn-play').addEventListener('click', () => this.onPlay());
    document.getElementById('btn-stop').addEventListener('click', () => this.onStop());
    document.getElementById('btn-compile').addEventListener('click', () => this.onCompile());
    document.getElementById('btn-download').addEventListener('click', () => this.onDownload());
    document.getElementById('btn-clear-console').addEventListener('click', () => Utils.clearConsole());
    document.getElementById('btn-fullscreen').addEventListener('click', () => {
      document.getElementById('stage-panel').classList.toggle('fullscreen');
    });
    document.getElementById('file-input').addEventListener('change', (e) => this.onFileSelected(e));

    // Sprite panel
    document.getElementById('btn-add-sprite').addEventListener('click', () => {
      this.project.addSprite();
      this.refreshSpriteList();
      this.updateProperties();
      Utils.log('Sprite added', 'info');
    });
    document.getElementById('btn-delete-sprite').addEventListener('click', () => {
      if (this.project.removeSprite(this.project.selectedSpriteId)) {
        this.refreshSpriteList();
        this.updateProperties();
      }
    });

    // Mode tabs
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchMode(tab.dataset.mode));
    });

    // CBS
    document.getElementById('btn-cbs-run').addEventListener('click', () => this.runCBS());
    document.getElementById('btn-cbs-format').addEventListener('click', () => {
      const ed = document.getElementById('cbs-editor');
      ed.value = CBS.format(ed.value);
    });

    // Properties
    ['prop-name', 'prop-x', 'prop-y', 'prop-dir', 'prop-size'].forEach(id => {
      document.getElementById(id).addEventListener('change', () => this.applyProperties());
    });
    document.getElementById('prop-visible').addEventListener('change', () => this.applyProperties());

    // Costumes
    document.getElementById('btn-add-costume').addEventListener('click', () => {
      const sprite = this.project.selectedSprite;
      if (sprite) {
        sprite.addCostume(new Costume('costume' + (sprite.costumes.length + 1)));
        this.refreshCostumes();
        Utils.log('Costume added', 'info');
      }
    });

    // Keyboard
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        this.onPlay();
      }
    });
  },

  switchMode(mode) {
    this.currentMode = mode;
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
    document.querySelectorAll('.mode-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById('mode-' + mode);
    if (panel) panel.classList.add('active');

    if (mode === 'blocks') {
      setTimeout(() => Editor.resize(), 50);
    } else if (mode === 'draw') {
      const sprite = this.project.selectedSprite;
      if (sprite) SpriteEditor.loadFromCostume(sprite.costume);
    } else if (mode === 'costumes') {
      this.refreshCostumes();
    } else if (mode === 'cbs') {
      const sprite = this.project.selectedSprite;
      if (sprite) document.getElementById('cbs-editor').value = sprite.cbsSource || '';
    }
  },

  refreshSpriteList() {
    const list = document.getElementById('sprite-list');
    list.innerHTML = '';
    for (const sprite of this.project.sprites) {
      const item = document.createElement('div');
      item.className = 'sprite-item' + (sprite.id === this.project.selectedSpriteId ? ' active' : '');
      item.dataset.id = sprite.id;

      const thumb = document.createElement('canvas');
      thumb.width = 36; thumb.height = 36;
      sprite.drawThumbnail(thumb);

      const name = document.createElement('span');
      name.className = 'name';
      name.textContent = sprite.name;

      item.appendChild(thumb);
      item.appendChild(name);
      item.addEventListener('click', () => {
        this.project.selectSprite(sprite.id);
        this.refreshSpriteList();
        this.updateProperties();
        if (this.currentMode === 'cbs') {
          document.getElementById('cbs-editor').value = sprite.cbsSource || '';
        }
        if (this.currentMode === 'draw') {
          SpriteEditor.loadFromCostume(sprite.costume);
        }
        if (this.currentMode === 'costumes') this.refreshCostumes();
      });
      list.appendChild(item);
    }
  },

  refreshCostumes() {
    const list = document.getElementById('costume-list');
    list.innerHTML = '';
    const sprite = this.project.selectedSprite;
    if (!sprite) return;

    sprite.costumes.forEach((costume, idx) => {
      const card = document.createElement('div');
      card.className = 'costume-card' + (idx === sprite.currentCostume ? ' active' : '');
      const c = document.createElement('canvas');
      c.width = 64; c.height = 64;
      const ctx = c.getContext('2d');
      ctx.drawImage(costume.canvas, 0, 0, 64, 64);
      const name = document.createElement('div');
      name.className = 'cname';
      name.textContent = costume.name;
      card.appendChild(c);
      card.appendChild(name);
      card.addEventListener('click', () => {
        sprite.currentCostume = idx;
        this.refreshCostumes();
        this.refreshSpriteList();
      });
      list.appendChild(card);
    });
  },

  updateProperties() {
    const s = this.project.selectedSprite;
    if (!s) return;
    document.getElementById('prop-name').value = s.name;
    document.getElementById('prop-x').value = Math.round(s.x);
    document.getElementById('prop-y').value = Math.round(s.y);
    document.getElementById('prop-dir').value = Math.round(s.direction);
    document.getElementById('prop-size').value = Math.round(s.size);
    document.getElementById('prop-visible').checked = s.visible;
  },

  applyProperties() {
    const s = this.project.selectedSprite;
    if (!s) return;
    s.name = document.getElementById('prop-name').value || s.name;
    s.x = parseFloat(document.getElementById('prop-x').value) || 0;
    s.y = parseFloat(document.getElementById('prop-y').value) || 0;
    s.direction = parseFloat(document.getElementById('prop-dir').value) || 90;
    s.size = parseFloat(document.getElementById('prop-size').value) || 100;
    s.visible = document.getElementById('prop-visible').checked;
    this.refreshSpriteList();
  },

  getProjectName() {
    return document.getElementById('project-name').value.trim() || 'Untitled Project';
  },

  onNew() {
    if (!confirm('Create a new project? Unsaved changes will be lost.')) return;
    this.runtime.stop();
    this.project = new Project();
    this.project.addSprite('Sprite1');
    this.runtime.setProject(this.project);
    Editor.clear();
    Editor.loadStarter();
    document.getElementById('project-name').value = 'Untitled Project';
    document.getElementById('cbs-editor').value = '';
    this.refreshSpriteList();
    this.updateProperties();
    this.updateButtons(false);
    Utils.clearConsole();
    Utils.log('New project created', 'info');
  },

  onSave() {
    // Save CBS source of current sprite
    const sprite = this.project.selectedSprite;
    if (sprite) sprite.cbsSource = document.getElementById('cbs-editor').value;

    this.project.name = this.getProjectName();
    const data = this.project.serialize();
    // Also save current Blockly workspace into first sprite for simplicity
    data.blockly = Blockly.serialization.workspaces.save(this.workspace);

    const json = JSON.stringify(data, null, 2);
    const filename = this.getProjectName().replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.codeblock';
    Utils.downloadFile(filename, json, 'application/json');
    Utils.log('Project saved: ' + filename, 'success');
  },

  onFileSelected(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        this.project = Project.deserialize(data);
        this.runtime.setProject(this.project);
        document.getElementById('project-name').value = this.project.name;
        if (data.blockly) {
          Blockly.serialization.workspaces.load(data.blockly, this.workspace);
        }
        this.refreshSpriteList();
        this.updateProperties();
        Utils.log('Loaded: ' + this.project.name, 'success');
      } catch (err) {
        Utils.log('Load failed: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  },

  onPlay() {
    this.runtime.stop();

    // Save current CBS
    const sel = this.project.selectedSprite;
    if (sel) sel.cbsSource = document.getElementById('cbs-editor').value;

    const scriptsMap = {};

    // 1. Blockly scripts (applied to selected sprite for now)
    const blockScripts = Compiler.compile(this.workspace);
    if (blockScripts.length && sel) {
      scriptsMap[sel.id] = (scriptsMap[sel.id] || []).concat(blockScripts);
    }

    // 2. CBS scripts for every sprite that has source
    for (const sprite of this.project.sprites) {
      if (sprite.cbsSource && sprite.cbsSource.trim()) {
        const cbsScripts = CBS.compile(sprite.cbsSource);
        if (cbsScripts && cbsScripts.length) {
          scriptsMap[sprite.id] = (scriptsMap[sprite.id] || []).concat(cbsScripts);
        }
      }
    }

    if (Object.keys(scriptsMap).length === 0) {
      Utils.log('No scripts found. Add Blocks (when flag clicked) or write CBS code.', 'warn');
      return;
    }

    this.updateButtons(true);
    this.runtime.start(scriptsMap).then(() => {
      if (!this.runtime.running) this.updateButtons(false);
    });
  },

  runCBS() {
    const source = document.getElementById('cbs-editor').value;
    const sprite = this.project.selectedSprite;
    if (!sprite) return;
    sprite.cbsSource = source;

    const scripts = CBS.compile(source);
    if (!scripts || scripts.length === 0) {
      Utils.log('CBS: nothing to run', 'warn');
      return;
    }
    this.runtime.stop();
    this.updateButtons(true);
    const map = {};
    map[sprite.id] = scripts;
    this.runtime.start(map).then(() => {
      if (!this.runtime.running) this.updateButtons(false);
    });
  },

  onStop() {
    this.runtime.stop();
    this.updateButtons(false);
  },

  onCompile() {
    const scripts = Compiler.compile(this.workspace);
    Utils.log('Blockly scripts: ' + scripts.length, 'info');

    const source = document.getElementById('cbs-editor').value;
    if (source.trim()) {
      const cbs = CBS.compile(source);
      Utils.log('CBS scripts: ' + (cbs ? cbs.length : 0), 'info');
    }

    // Dump generated JS
    javascript.javascriptGenerator.init(this.workspace);
    let code = '';
    const tops = this.workspace.getTopBlocks(false);
    for (const block of tops) {
      if (block.type === 'events_when_flag') {
        let b = block.getNextBlock();
        while (b) {
          code += javascript.javascriptGenerator.blockToCode(b);
          b = b.getNextBlock();
        }
      }
    }
    code = javascript.javascriptGenerator.finish(code);
    console.log('=== Generated JS ===\n' + code);
    Utils.log('Generated JS in browser console (F12)', 'info');
  },

  onDownload() {
    const choice = prompt('Download as:\n1 = Standalone HTML Game\n2 = Project File (.codeblock)', '1');
    if (choice === '1') {
      // Simple HTML export using current Blockly of selected sprite
      const html = Compiler.compileToHTML(this.workspace, this.getProjectName());
      Utils.downloadFile(this.getProjectName().replace(/\s+/g, '_') + '.html', html, 'text/html');
      Utils.log('HTML game downloaded', 'success');
    } else if (choice === '2') {
      this.onSave();
    }
  },

  updateButtons(playing) {
    document.getElementById('btn-play').disabled = playing;
    document.getElementById('btn-stop').disabled = !playing;
  }
};

window.App = App;

// Boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
