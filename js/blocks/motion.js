/**
 * CodeBlock – Motion Blocks
 */

Blockly.defineBlocksWithJsonArray([
  {
    "type": "motion_move_steps",
    "message0": "move %1 steps",
    "args0": [
      { "type": "input_value", "name": "STEPS", "check": "Number" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "Move the sprite forward by the given number of steps",
    "helpUrl": ""
  },
  {
    "type": "motion_turn_right",
    "message0": "turn right %1 degrees",
    "args0": [
      { "type": "input_value", "name": "DEGREES", "check": "Number" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "Turn the sprite clockwise",
    "helpUrl": ""
  },
  {
    "type": "motion_turn_left",
    "message0": "turn left %1 degrees",
    "args0": [
      { "type": "input_value", "name": "DEGREES", "check": "Number" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "Turn the sprite counter-clockwise",
    "helpUrl": ""
  },
  {
    "type": "motion_goto_xy",
    "message0": "go to x: %1 y: %2",
    "args0": [
      { "type": "input_value", "name": "X", "check": "Number" },
      { "type": "input_value", "name": "Y", "check": "Number" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "Move sprite to absolute position",
    "helpUrl": ""
  },
  {
    "type": "motion_change_x",
    "message0": "change x by %1",
    "args0": [
      { "type": "input_value", "name": "DX", "check": "Number" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "Change the x position by the given amount",
    "helpUrl": ""
  },
  {
    "type": "motion_change_y",
    "message0": "change y by %1",
    "args0": [
      { "type": "input_value", "name": "DY", "check": "Number" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "Change the y position by the given amount",
    "helpUrl": ""
  },
  {
    "type": "motion_set_x",
    "message0": "set x to %1",
    "args0": [
      { "type": "input_value", "name": "X", "check": "Number" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "Set the x position",
    "helpUrl": ""
  },
  {
    "type": "motion_set_y",
    "message0": "set y to %1",
    "args0": [
      { "type": "input_value", "name": "Y", "check": "Number" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "Set the y position",
    "helpUrl": ""
  },
  {
    "type": "motion_point_direction",
    "message0": "point in direction %1",
    "args0": [
      { "type": "input_value", "name": "DIRECTION", "check": "Number" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "Point the sprite in a direction (0-360)",
    "helpUrl": ""
  },
  {
    "type": "motion_x_position",
    "message0": "x position",
    "output": "Number",
    "colour": 230,
    "tooltip": "Current x position of the sprite",
    "helpUrl": ""
  },
  {
    "type": "motion_y_position",
    "message0": "y position",
    "output": "Number",
    "colour": 230,
    "tooltip": "Current y position of the sprite",
    "helpUrl": ""
  },
  {
    "type": "motion_direction",
    "message0": "direction",
    "output": "Number",
    "colour": 230,
    "tooltip": "Current direction of the sprite",
    "helpUrl": ""
  }
]);

// JavaScript generators
javascript.javascriptGenerator.forBlock['motion_move_steps'] = function(block, generator) {
  const steps = generator.valueToCode(block, 'STEPS', generator.ORDER_ATOMIC) || '0';
  return `sprite.moveSteps(${steps});\n`;
};

javascript.javascriptGenerator.forBlock['motion_turn_right'] = function(block, generator) {
  const deg = generator.valueToCode(block, 'DEGREES', generator.ORDER_ATOMIC) || '0';
  return `sprite.turn(${deg});\n`;
};

javascript.javascriptGenerator.forBlock['motion_turn_left'] = function(block, generator) {
  const deg = generator.valueToCode(block, 'DEGREES', generator.ORDER_ATOMIC) || '0';
  return `sprite.turn(-${deg});\n`;
};

javascript.javascriptGenerator.forBlock['motion_goto_xy'] = function(block, generator) {
  const x = generator.valueToCode(block, 'X', generator.ORDER_ATOMIC) || '0';
  const y = generator.valueToCode(block, 'Y', generator.ORDER_ATOMIC) || '0';
  return `sprite.goto(${x}, ${y});\n`;
};

javascript.javascriptGenerator.forBlock['motion_change_x'] = function(block, generator) {
  const dx = generator.valueToCode(block, 'DX', generator.ORDER_ATOMIC) || '0';
  return `sprite.x += ${dx};\n`;
};

javascript.javascriptGenerator.forBlock['motion_change_y'] = function(block, generator) {
  const dy = generator.valueToCode(block, 'DY', generator.ORDER_ATOMIC) || '0';
  return `sprite.y += ${dy};\n`;
};

javascript.javascriptGenerator.forBlock['motion_set_x'] = function(block, generator) {
  const x = generator.valueToCode(block, 'X', generator.ORDER_ATOMIC) || '0';
  return `sprite.x = ${x};\n`;
};

javascript.javascriptGenerator.forBlock['motion_set_y'] = function(block, generator) {
  const y = generator.valueToCode(block, 'Y', generator.ORDER_ATOMIC) || '0';
  return `sprite.y = ${y};\n`;
};

javascript.javascriptGenerator.forBlock['motion_point_direction'] = function(block, generator) {
  const dir = generator.valueToCode(block, 'DIRECTION', generator.ORDER_ATOMIC) || '90';
  return `sprite.direction = ${dir};\n`;
};

javascript.javascriptGenerator.forBlock['motion_x_position'] = function(block, generator) {
  return ['sprite.x', generator.ORDER_ATOMIC];
};

javascript.javascriptGenerator.forBlock['motion_y_position'] = function(block, generator) {
  return ['sprite.y', generator.ORDER_ATOMIC];
};

javascript.javascriptGenerator.forBlock['motion_direction'] = function(block, generator) {
  return ['sprite.direction', generator.ORDER_ATOMIC];
};
