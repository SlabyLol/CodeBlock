/**
 * CodeBlock – Download / Export
 */

const Downloader = {
  /**
   * Save the current project as a .codeblock JSON file
   */
  saveProject(workspace, projectName) {
    const state = Blockly.serialization.workspaces.save(workspace);
    const data = {
      name: projectName || 'Untitled Project',
      version: '1.0',
      created: new Date().toISOString(),
      workspace: state
    };
    const json = JSON.stringify(data, null, 2);
    const filename = (projectName || 'project').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.codeblock';
    Utils.downloadFile(filename, json, 'application/json');
    Utils.log(`Project saved as ${filename}`, 'success');
  },

  /**
   * Load a .codeblock file into the workspace
   */
  loadProject(file, workspace, onLoaded) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.workspace) throw new Error('Invalid project file');
        Blockly.serialization.workspaces.load(data.workspace, workspace);
        if (onLoaded) onLoaded(data.name || 'Loaded Project');
        Utils.log(`Loaded project: ${data.name || 'Unnamed'}`, 'success');
      } catch (err) {
        Utils.log('Failed to load project: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  },

  /**
   * Download a compiled standalone HTML game
   */
  downloadGame(workspace, projectName) {
    const html = Compiler.compileToHTML(workspace, projectName || 'My Game');
    const filename = (projectName || 'game').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.html';
    Utils.downloadFile(filename, html, 'text/html');
    Utils.log(`Game downloaded as ${filename}`, 'success');
  },

  /**
   * Export only the generated JavaScript source
   */
  downloadJS(workspace, projectName) {
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
    const filename = (projectName || 'script').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.js';
    Utils.downloadFile(filename, code, 'text/javascript');
    Utils.log(`JavaScript exported as ${filename}`, 'success');
  }
};

window.Downloader = Downloader;
