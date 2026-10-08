/**
 * CodeBlock – Blockly Editor Setup (v2)
 */

const Editor = {
  workspace: null,

  init() {
    const toolbox = {
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category', name: 'Motion', colour: '230',
          contents: [
            { kind: 'block', type: 'motion_move_steps' },
            { kind: 'block', type: 'motion_turn_right' },
            { kind: 'block', type: 'motion_turn_left' },
            { kind: 'block', type: 'motion_goto_xy' },
            { kind: 'block', type: 'motion_change_x' },
            { kind: 'block', type: 'motion_change_y' },
            { kind: 'block', type: 'motion_set_x' },
            { kind: 'block', type: 'motion_set_y' },
            { kind: 'block', type: 'motion_point_direction' },
            { kind: 'block', type: 'motion_x_position' },
            { kind: 'block', type: 'motion_y_position' },
            { kind: 'block', type: 'motion_direction' }
          ]
        },
        {
          kind: 'category', name: 'Looks', colour: '160',
          contents: [
            { kind: 'block', type: 'looks_say' },
            { kind: 'block', type: 'looks_say_for' },
            { kind: 'block', type: 'looks_show' },
            { kind: 'block', type: 'looks_hide' },
            { kind: 'block', type: 'looks_set_size' },
            { kind: 'block', type: 'looks_change_size' },
            { kind: 'block', type: 'looks_size' },
            { kind: 'block', type: 'looks_set_color' },
            { kind: 'block', type: 'looks_next_costume' },
            { kind: 'block', type: 'looks_switch_costume' }
          ]
        },
        {
          kind: 'category', name: 'Events', colour: '45',
          contents: [
            { kind: 'block', type: 'events_when_flag' },
            { kind: 'block', type: 'events_when_key' },
            { kind: 'block', type: 'events_when_clicked' },
            { kind: 'block', type: 'events_broadcast' },
            { kind: 'block', type: 'events_when_broadcast' }
          ]
        },
        {
          kind: 'category', name: 'Control', colour: '120',
          contents: [
            { kind: 'block', type: 'control_wait' },
            { kind: 'block', type: 'control_repeat' },
            { kind: 'block', type: 'control_forever' },
            { kind: 'block', type: 'control_if' },
            { kind: 'block', type: 'control_if_else' },
            { kind: 'block', type: 'control_wait_until' },
            { kind: 'block', type: 'control_repeat_until' },
            { kind: 'block', type: 'control_stop' }
          ]
        },
        {
          kind: 'category', name: 'Sensing', colour: '190',
          contents: [
            { kind: 'block', type: 'sensing_key_pressed' },
            { kind: 'block', type: 'sensing_mouse_x' },
            { kind: 'block', type: 'sensing_mouse_y' },
            { kind: 'block', type: 'sensing_mouse_down' },
            { kind: 'block', type: 'sensing_timer' },
            { kind: 'block', type: 'sensing_reset_timer' },
            { kind: 'block', type: 'sensing_touching_edge' }
          ]
        },
        {
          kind: 'category', name: 'Operators', colour: '230',
          contents: [
            { kind: 'block', type: 'math_number' },
            { kind: 'block', type: 'text' },
            { kind: 'block', type: 'math_arithmetic' },
            { kind: 'block', type: 'math_random' },
            { kind: 'block', type: 'logic_compare' },
            { kind: 'block', type: 'logic_operation' },
            { kind: 'block', type: 'logic_negate' },
            { kind: 'block', type: 'logic_boolean' },
            { kind: 'block', type: 'text_join' }
          ]
        },
        {
          kind: 'category', name: 'Variables', colour: '330', custom: 'VARIABLE'
        }
      ]
    };

    this.workspace = Blockly.inject('blockly-div', {
      toolbox: toolbox,
      media: 'https://unpkg.com/blockly/media/',
      grid: { spacing: 25, length: 3, colour: '#2a3140', snap: true },
      zoom: { controls: true, wheel: true, startScale: 0.85, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2 },
      trashcan: true,
      move: { scrollbars: true, drag: true, wheel: true },
      renderer: 'geras',
      theme: Blockly.Themes.Classic
    });

    this.loadStarter();

    const observer = new ResizeObserver(() => {
      if (this.workspace) Blockly.svgResize(this.workspace);
    });
    const el = document.getElementById('mode-blocks') || document.getElementById('editor-main');
    if (el) observer.observe(el);

    return this.workspace;
  },

  loadStarter() {
    const xml = `<xml xmlns="https://developers.google.com/blockly/xml">
      <block type="events_when_flag" x="40" y="40">
        <next>
          <block type="control_forever">
            <statement name="DO">
              <block type="motion_move_steps">
                <value name="STEPS"><block type="math_number"><field name="NUM">4</field></block></value>
                <next>
                  <block type="motion_turn_right">
                    <value name="DEGREES"><block type="math_number"><field name="NUM">12</field></block></value>
                  </block>
                </next>
              </block>
            </statement>
          </block>
        </next>
      </block>
    </xml>`;
    try {
      const dom = Blockly.utils.xml.textToDom(xml);
      Blockly.Xml.domToWorkspace(dom, this.workspace);
    } catch (e) {
      console.warn('Starter load failed', e);
    }
  },

  clear() {
    if (this.workspace) this.workspace.clear();
  },

  getWorkspace() {
    return this.workspace;
  },

  resize() {
    if (this.workspace) Blockly.svgResize(this.workspace);
  }
};

window.Editor = Editor;
