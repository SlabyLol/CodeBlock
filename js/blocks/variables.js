/**
 * CodeBlock – Variables Blocks
 * Uses Blockly built-in variable support + custom helpers
 */

// We rely mostly on Blockly's built-in variable blocks.
// Here we just add a couple of convenience blocks and ensure generators work.

Blockly.defineBlocksWithJsonArray([
  {
    "type": "variables_set",
    "message0": "set %1 to %2",
    "args0": [
      { "type": "field_variable", "name": "VAR", "variable": "item" },
      { "type": "input_value", "name": "VALUE" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 330,
    "tooltip": "Set a variable to a value",
    "helpUrl": ""
  },
  {
    "type": "variables_get",
    "message0": "%1",
    "args0": [
      { "type": "field_variable", "name": "VAR", "variable": "item" }
    ],
    "output": null,
    "colour": 330,
    "tooltip": "Get the value of a variable",
    "helpUrl": ""
  },
  {
    "type": "variables_change",
    "message0": "change %1 by %2",
    "args0": [
      { "type": "field_variable", "name": "VAR", "variable": "item" },
      { "type": "input_value", "name": "DELTA", "check": "Number" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 330,
    "tooltip": "Change a variable by a number",
    "helpUrl": ""
  }
]);

javascript.javascriptGenerator.forBlock['variables_set'] = function(block, generator) {
  const varName = generator.getVariableName(block.getFieldValue('VAR'));
  const value = generator.valueToCode(block, 'VALUE', generator.ORDER_ASSIGNMENT) || '0';
  return `${varName} = ${value};\n`;
};

javascript.javascriptGenerator.forBlock['variables_get'] = function(block, generator) {
  const varName = generator.getVariableName(block.getFieldValue('VAR'));
  return [varName, generator.ORDER_ATOMIC];
};

javascript.javascriptGenerator.forBlock['variables_change'] = function(block, generator) {
  const varName = generator.getVariableName(block.getFieldValue('VAR'));
  const delta = generator.valueToCode(block, 'DELTA', generator.ORDER_ATOMIC) || '1';
  return `${varName} = (${varName} || 0) + ${delta};\n`;
};
