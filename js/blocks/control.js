/**
 * CodeBlock – Control Blocks
 */

Blockly.defineBlocksWithJsonArray([
  {
    "type": "control_wait",
    "message0": "wait %1 seconds",
    "args0": [
      { "type": "input_value", "name": "SECS", "check": "Number" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "Wait for the given number of seconds",
    "helpUrl": ""
  },
  {
    "type": "control_repeat",
    "message0": "repeat %1 times",
    "args0": [
      { "type": "input_value", "name": "TIMES", "check": "Number" }
    ],
    "message1": "%1",
    "args1": [
      { "type": "input_statement", "name": "DO" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "Repeat the blocks inside a number of times",
    "helpUrl": ""
  },
  {
    "type": "control_forever",
    "message0": "forever",
    "message1": "%1",
    "args1": [
      { "type": "input_statement", "name": "DO" }
    ],
    "previousStatement": null,
    "colour": 120,
    "tooltip": "Repeat the blocks inside forever",
    "helpUrl": ""
  },
  {
    "type": "control_if",
    "message0": "if %1 then",
    "args0": [
      { "type": "input_value", "name": "CONDITION", "check": "Boolean" }
    ],
    "message1": "%1",
    "args1": [
      { "type": "input_statement", "name": "DO" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "Run the blocks only if the condition is true",
    "helpUrl": ""
  },
  {
    "type": "control_if_else",
    "message0": "if %1 then",
    "args0": [
      { "type": "input_value", "name": "CONDITION", "check": "Boolean" }
    ],
    "message1": "%1",
    "args1": [
      { "type": "input_statement", "name": "DO" }
    ],
    "message2": "else %1",
    "args2": [
      { "type": "input_statement", "name": "ELSE" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "Run one set of blocks or another depending on the condition",
    "helpUrl": ""
  },
  {
    "type": "control_wait_until",
    "message0": "wait until %1",
    "args0": [
      { "type": "input_value", "name": "CONDITION", "check": "Boolean" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "Wait until the condition becomes true",
    "helpUrl": ""
  },
  {
    "type": "control_repeat_until",
    "message0": "repeat until %1",
    "args0": [
      { "type": "input_value", "name": "CONDITION", "check": "Boolean" }
    ],
    "message1": "%1",
    "args1": [
      { "type": "input_statement", "name": "DO" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "Repeat until the condition is true",
    "helpUrl": ""
  },
  {
    "type": "control_stop",
    "message0": "stop %1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "STOP_OPTION",
        "options": [
          ["all", "all"],
          ["this script", "this"],
          ["other scripts", "other"]
        ]
      }
    ],
    "previousStatement": null,
    "colour": 120,
    "tooltip": "Stop scripts",
    "helpUrl": ""
  }
]);

javascript.javascriptGenerator.forBlock['control_wait'] = function(block, generator) {
  const secs = generator.valueToCode(block, 'SECS', generator.ORDER_ATOMIC) || '1';
  return `await runtime.wait(${secs});\n`;
};

javascript.javascriptGenerator.forBlock['control_repeat'] = function(block, generator) {
  const times = generator.valueToCode(block, 'TIMES', generator.ORDER_ATOMIC) || '10';
  const branch = generator.statementToCode(block, 'DO');
  return `for (let __i = 0; __i < ${times}; __i++) {\n${branch}}\n`;
};

javascript.javascriptGenerator.forBlock['control_forever'] = function(block, generator) {
  const branch = generator.statementToCode(block, 'DO');
  return `while (runtime.running) {\n${branch}  await runtime.yieldFrame();\n}\n`;
};

javascript.javascriptGenerator.forBlock['control_if'] = function(block, generator) {
  const condition = generator.valueToCode(block, 'CONDITION', generator.ORDER_NONE) || 'false';
  const branch = generator.statementToCode(block, 'DO');
  return `if (${condition}) {\n${branch}}\n`;
};

javascript.javascriptGenerator.forBlock['control_if_else'] = function(block, generator) {
  const condition = generator.valueToCode(block, 'CONDITION', generator.ORDER_NONE) || 'false';
  const branch = generator.statementToCode(block, 'DO');
  const elseBranch = generator.statementToCode(block, 'ELSE');
  return `if (${condition}) {\n${branch}} else {\n${elseBranch}}\n`;
};

javascript.javascriptGenerator.forBlock['control_wait_until'] = function(block, generator) {
  const condition = generator.valueToCode(block, 'CONDITION', generator.ORDER_NONE) || 'false';
  return `while (!(${condition}) && runtime.running) { await runtime.yieldFrame(); }\n`;
};

javascript.javascriptGenerator.forBlock['control_repeat_until'] = function(block, generator) {
  const condition = generator.valueToCode(block, 'CONDITION', generator.ORDER_NONE) || 'false';
  const branch = generator.statementToCode(block, 'DO');
  return `while (!(${condition}) && runtime.running) {\n${branch}  await runtime.yieldFrame();\n}\n`;
};

javascript.javascriptGenerator.forBlock['control_stop'] = function(block) {
  const option = block.getFieldValue('STOP_OPTION');
  if (option === 'all') return `runtime.stop();\n`;
  if (option === 'this') return `return;\n`;
  return `/* stop other scripts */\n`;
};
