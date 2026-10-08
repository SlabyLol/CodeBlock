/**
 * CodeBlock – Looks Blocks
 */

Blockly.defineBlocksWithJsonArray([
  {
    "type": "looks_say",
    "message0": "say %1",
    "args0": [
      { "type": "input_value", "name": "MESSAGE", "check": "String" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160,
    "tooltip": "Display a speech bubble",
    "helpUrl": ""
  },
  {
    "type": "looks_say_for",
    "message0": "say %1 for %2 seconds",
    "args0": [
      { "type": "input_value", "name": "MESSAGE", "check": "String" },
      { "type": "input_value", "name": "SECS", "check": "Number" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160,
    "tooltip": "Say something for a limited time",
    "helpUrl": ""
  },
  {
    "type": "looks_show",
    "message0": "show",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160,
    "tooltip": "Make the sprite visible",
    "helpUrl": ""
  },
  {
    "type": "looks_hide",
    "message0": "hide",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160,
    "tooltip": "Hide the sprite",
    "helpUrl": ""
  },
  {
    "type": "looks_set_size",
    "message0": "set size to %1 %",
    "args0": [
      { "type": "input_value", "name": "SIZE", "check": "Number" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160,
    "tooltip": "Set the size of the sprite",
    "helpUrl": ""
  },
  {
    "type": "looks_change_size",
    "message0": "change size by %1",
    "args0": [
      { "type": "input_value", "name": "CHANGE", "check": "Number" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160,
    "tooltip": "Change the size of the sprite",
    "helpUrl": ""
  },
  {
    "type": "looks_size",
    "message0": "size",
    "output": "Number",
    "colour": 160,
    "tooltip": "Current size of the sprite",
    "helpUrl": ""
  },
  {
    "type": "looks_set_color",
    "message0": "set color to %1",
    "args0": [
      { "type": "input_value", "name": "COLOR", "check": "String" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160,
    "tooltip": "Set the fill color of the sprite",
    "helpUrl": ""
  }
]);

javascript.javascriptGenerator.forBlock['looks_say'] = function(block, generator) {
  const msg = generator.valueToCode(block, 'MESSAGE', generator.ORDER_ATOMIC) || '""';
  return `sprite.say(${msg});\n`;
};

javascript.javascriptGenerator.forBlock['looks_say_for'] = function(block, generator) {
  const msg = generator.valueToCode(block, 'MESSAGE', generator.ORDER_ATOMIC) || '""';
  const secs = generator.valueToCode(block, 'SECS', generator.ORDER_ATOMIC) || '2';
  return `await sprite.sayFor(${msg}, ${secs});\n`;
};

javascript.javascriptGenerator.forBlock['looks_show'] = function() {
  return `sprite.visible = true;\n`;
};

javascript.javascriptGenerator.forBlock['looks_hide'] = function() {
  return `sprite.visible = false;\n`;
};

javascript.javascriptGenerator.forBlock['looks_set_size'] = function(block, generator) {
  const size = generator.valueToCode(block, 'SIZE', generator.ORDER_ATOMIC) || '100';
  return `sprite.size = ${size};\n`;
};

javascript.javascriptGenerator.forBlock['looks_change_size'] = function(block, generator) {
  const change = generator.valueToCode(block, 'CHANGE', generator.ORDER_ATOMIC) || '0';
  return `sprite.size += ${change};\n`;
};

javascript.javascriptGenerator.forBlock['looks_size'] = function(block, generator) {
  return ['sprite.size', generator.ORDER_ATOMIC];
};

javascript.javascriptGenerator.forBlock['looks_set_color'] = function(block, generator) {
  const color = generator.valueToCode(block, 'COLOR', generator.ORDER_ATOMIC) || '"#4f8cff"';
  return `sprite.color = ${color};\n`;
};
