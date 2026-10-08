/**
 * CodeBlock – Sensing Blocks
 */

Blockly.defineBlocksWithJsonArray([
  {
    "type": "sensing_key_pressed",
    "message0": "key %1 pressed?",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "KEY",
        "options": [
          ["space", "space"],
          ["up arrow", "ArrowUp"],
          ["down arrow", "ArrowDown"],
          ["left arrow", "ArrowLeft"],
          ["right arrow", "ArrowRight"],
          ["a", "a"],
          ["w", "w"],
          ["s", "s"],
          ["d", "d"]
        ]
      }
    ],
    "output": "Boolean",
    "colour": 190,
    "tooltip": "Is the given key currently pressed?",
    "helpUrl": ""
  },
  {
    "type": "sensing_mouse_x",
    "message0": "mouse x",
    "output": "Number",
    "colour": 190,
    "tooltip": "X position of the mouse",
    "helpUrl": ""
  },
  {
    "type": "sensing_mouse_y",
    "message0": "mouse y",
    "output": "Number",
    "colour": 190,
    "tooltip": "Y position of the mouse",
    "helpUrl": ""
  },
  {
    "type": "sensing_mouse_down",
    "message0": "mouse down?",
    "output": "Boolean",
    "colour": 190,
    "tooltip": "Is the mouse button pressed?",
    "helpUrl": ""
  },
  {
    "type": "sensing_timer",
    "message0": "timer",
    "output": "Number",
    "colour": 190,
    "tooltip": "Time since the project started (in seconds)",
    "helpUrl": ""
  },
  {
    "type": "sensing_reset_timer",
    "message0": "reset timer",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 190,
    "tooltip": "Reset the timer to zero",
    "helpUrl": ""
  },
  {
    "type": "sensing_touching_edge",
    "message0": "touching edge?",
    "output": "Boolean",
    "colour": 190,
    "tooltip": "Is the sprite touching the edge of the stage?",
    "helpUrl": ""
  }
]);

javascript.javascriptGenerator.forBlock['sensing_key_pressed'] = function(block, generator) {
  const key = block.getFieldValue('KEY');
  return [`runtime.isKeyPressed("${key}")`, generator.ORDER_FUNCTION_CALL];
};

javascript.javascriptGenerator.forBlock['sensing_mouse_x'] = function(block, generator) {
  return ['runtime.mouseX', generator.ORDER_ATOMIC];
};

javascript.javascriptGenerator.forBlock['sensing_mouse_y'] = function(block, generator) {
  return ['runtime.mouseY', generator.ORDER_ATOMIC];
};

javascript.javascriptGenerator.forBlock['sensing_mouse_down'] = function(block, generator) {
  return ['runtime.mouseDown', generator.ORDER_ATOMIC];
};

javascript.javascriptGenerator.forBlock['sensing_timer'] = function(block, generator) {
  return ['runtime.timer', generator.ORDER_ATOMIC];
};

javascript.javascriptGenerator.forBlock['sensing_reset_timer'] = function() {
  return `runtime.resetTimer();\n`;
};

javascript.javascriptGenerator.forBlock['sensing_touching_edge'] = function(block, generator) {
  return ['sprite.isTouchingEdge()', generator.ORDER_FUNCTION_CALL];
};
