/**
 * CodeBlock – Events Blocks
 */

Blockly.defineBlocksWithJsonArray([
  {
    "type": "events_when_flag",
    "message0": "when ⚑ clicked",
    "nextStatement": null,
    "colour": 45,
    "tooltip": "Start of the program – runs when Play is pressed",
    "helpUrl": ""
  },
  {
    "type": "events_when_key",
    "message0": "when %1 key pressed",
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
          ["b", "b"],
          ["c", "c"],
          ["w", "w"],
          ["s", "s"],
          ["d", "d"]
        ]
      }
    ],
    "nextStatement": null,
    "colour": 45,
    "tooltip": "Run when a specific key is pressed",
    "helpUrl": ""
  },
  {
    "type": "events_when_clicked",
    "message0": "when this sprite clicked",
    "nextStatement": null,
    "colour": 45,
    "tooltip": "Run when the sprite is clicked",
    "helpUrl": ""
  },
  {
    "type": "events_broadcast",
    "message0": "broadcast %1",
    "args0": [
      { "type": "input_value", "name": "MESSAGE", "check": "String" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 45,
    "tooltip": "Send a message to all sprites",
    "helpUrl": ""
  },
  {
    "type": "events_when_broadcast",
    "message0": "when I receive %1",
    "args0": [
      { "type": "input_value", "name": "MESSAGE", "check": "String" }
    ],
    "nextStatement": null,
    "colour": 45,
    "tooltip": "Run when a specific message is received",
    "helpUrl": ""
  }
]);

javascript.javascriptGenerator.forBlock['events_when_flag'] = function(block, generator) {
  const next = generator.statementToCode(block, 'NEXT') || generator.statementToCode(block);
  // The hat block itself doesn't generate code; the runtime looks for scripts starting with this
  return ''; // handled specially in runtime
};

javascript.javascriptGenerator.forBlock['events_when_key'] = function(block, generator) {
  return ''; // handled by runtime registration
};

javascript.javascriptGenerator.forBlock['events_when_clicked'] = function() {
  return '';
};

javascript.javascriptGenerator.forBlock['events_broadcast'] = function(block, generator) {
  const msg = generator.valueToCode(block, 'MESSAGE', generator.ORDER_ATOMIC) || '""';
  return `runtime.broadcast(${msg});\n`;
};

javascript.javascriptGenerator.forBlock['events_when_broadcast'] = function() {
  return '';
};
