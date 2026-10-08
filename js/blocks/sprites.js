/**
 * CodeBlock – Sprite / Looks extra blocks
 */

Blockly.defineBlocksWithJsonArray([
  {
    "type": "looks_next_costume",
    "message0": "next costume",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160,
    "tooltip": "Switch to the next costume"
  },
  {
    "type": "looks_switch_costume",
    "message0": "switch costume to %1",
    "args0": [
      { "type": "input_value", "name": "COSTUME" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160,
    "tooltip": "Switch to a specific costume by name or number"
  }
]);

javascript.javascriptGenerator.forBlock['looks_next_costume'] = function() {
  return 'sprite.nextCostume();\n';
};

javascript.javascriptGenerator.forBlock['looks_switch_costume'] = function(block, generator) {
  const c = generator.valueToCode(block, 'COSTUME', generator.ORDER_ATOMIC) || '0';
  return `sprite.switchCostume(${c});\n`;
};
