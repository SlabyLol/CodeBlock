/**
 * CodeBlock – Main Application
 */

(function () {
  let runtime = null;
  let workspace = null;

  function init() {
    // Stage
    const canvas = document.getElementById('stage');
    runtime = new Runtime(canvas);

    // Editor
    workspace = Editor.init();

    // Buttons
    document.getElementById('btn-new').addEventListener('click', onNew);
    document.getElementById('btn-load').addEventListener('click', onLoad);
    document.getElementById('btn-save').addEventListener('click', onSave);
    document.getElementById('btn-play').addEventListener('click', onPlay);
    document.getElementById('btn-stop').addEventListener('click', onStop);
    document.getElementById('btn-compile').addEventListener('click', onCompile);
    document.getElementById('btn-download').addEventListener('click', onDownload);
    document.getElementById('btn-clear-console').addEventListener('click', () => Utils.clearConsole());
    document.getElementById('btn-fullscreen').addEventListener('click', onFullscreen);

    document.getElementById('file-input').addEventListener('change', onFileSelected);

    // Keyboard shortcut: Ctrl+Enter = Play
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        onPlay();
      }
    });

    Utils.log('CodeBlock ready – drag blocks and press Play!', 'success');
  }

  function getProjectName() {
    return document.getElementById('project-name').value.trim() || 'Untitled Project';
  }

  function setProjectName(name) {
    document.getElementById('project-name').value = name;
  }

  function onNew() {
    if (confirm('Create a new project? Unsaved changes will be lost.')) {
      Editor.clear();
      Editor.loadStarter();
      setProjectName('Untitled Project');
      runtime.stop();
      updateButtons(false);
      Utils.clearConsole();
      Utils.log('New project created', 'info');
    }
  }

  function onLoad() {
    document.getElementById('file-input').click();
  }

  function onFileSelected(e) {
    const file = e.target.files[0];
    if (!file) return;
    Downloader.loadProject(file, workspace, (name) => {
      setProjectName(name);
    });
    e.target.value = '';
  }

  function onSave() {
    Downloader.saveProject(workspace, getProjectName());
  }

  function onPlay() {
    runtime.stop();
    const scripts = Compiler.compile(workspace);
    if (scripts.length === 0) {
      Utils.log('No "when ⚑ clicked" script found. Add an Events block to start.', 'warn');
      return;
    }
    updateButtons(true);
    runtime.start(scripts).then(() => {
      // Scripts finished
      if (!runtime.running) updateButtons(false);
    }).catch(err => {
      Utils.log('Runtime error: ' + err.message, 'error');
      updateButtons(false);
    });
  }

  function onStop() {
    runtime.stop();
    updateButtons(false);
  }

  function onCompile() {
    const scripts = Compiler.compile(workspace);
    Utils.log(`Compiled ${scripts.length} script(s)`, 'info');

    // Also show generated JS in console for debugging
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
    console.log('=== Generated JavaScript ===');
    console.log(code);
    Utils.log('Generated JS printed to browser console (F12)', 'info');
  }

  function onDownload() {
    // Give user a choice via simple prompt for now
    const choice = prompt(
      'Download as:\n1 = Standalone HTML Game\n2 = Project File (.codeblock)\n3 = JavaScript only',
      '1'
    );
    if (choice === '1') {
      Downloader.downloadGame(workspace, getProjectName());
    } else if (choice === '2') {
      Downloader.saveProject(workspace, getProjectName());
    } else if (choice === '3') {
      Downloader.downloadJS(workspace, getProjectName());
    }
  }

  function onFullscreen() {
    const stageArea = document.getElementById('stage-area');
    stageArea.classList.toggle('fullscreen');
  }

  function updateButtons(playing) {
    document.getElementById('btn-play').disabled = playing;
    document.getElementById('btn-stop').disabled = !playing;
  }

  // Start everything when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
