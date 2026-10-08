/**
 * CodeBlock – Operators Blocks
 */

Blockly.defineBlocksWithJsonArray([
  {
    "type": "math_number",
    "message0": "%1",
    "args0": [
      { "type": "field_number", "name": "NUM", "value": 0 }
    ],
    "output": "Number",
    "colour": 230,
    "tooltip": "A number",
    "helpUrl": ""
  },
  {
    "type": "text",
    "message0": "%1",
    "args0": [
      { "type": "field_input", "name": "TEXT", "text": "" }
    ],
    "output": "String",
    "colour": 160,
    "tooltip": "A text string",
    "helpUrl": ""
  },
  {
    "type": "math_arithmetic",
    "message0": "%1 %2 %3",
    "args0": [
      { "type": "input_value", "name": "A", "check": "Number" },
      {
        "type": "field_dropdown",
        "name": "OP",
        "options": [
          ["+", "ADD"],
          ["-", "MINUS"],
          ["×", "MULTIPLY"],
          ["÷", "DIVIDE"]
        ]
      },
      { "type": "input_value", "name": "B", "check": "Number" }
    ],
    "output": "Number",
    "colour": 230,
    "tooltip": "Arithmetic operation",
    "helpUrl": ""
  },
  {
    "type": "math_random",
    "message0": "pick random %1 to %2",
    "args0": [
      { "type": "input_value", "name": "FROM", "check": "Number" },
      { "type": "input_value", "name": "TO", "check": "Number" }
    ],
    "output": "Number",
    "colour": 230,
    "tooltip": "Pick a random number between two values",
    "helpUrl": ""
  },
  {
    "type": "logic_compare",
    "message0": "%1 %2 %3",
    "args0": [
      { "type": "input_value", "name": "A" },
      {
        "type": "field_dropdown",
        "name": "OP",
        "options": [
          ["=", "EQ"],
          ["≠", "NEQ"],
          ["<", "LT"],
          ["≤", "LTE"],
          [">", "GT"],
          ["≥", "GTE"]
        ]
      },
      { "type": "input_value", "name": "B" }
    ],
    "output": "Boolean",
    "colour": 210,
    "tooltip": "Compare two values",
    "helpUrl": ""
  },
  {
    "type": "logic_operation",
    "message0": "%1 %2 %3",
    "args0": [
      { "type": "input_value", "name": "A", "check": "Boolean" },
      {
        "type": "field_dropdown",
        "name": "OP",
        "options": [
          ["and", "AND"],
          ["or", "OR"]
        ]
      },
      { "type": "input_value", "name": "B", "check": "Boolean" }
    ],
    "output": "Boolean",
    "colour": 210,
    "tooltip": "Logical and / or",
    "helpUrl": ""
  },
  {
    "type": "logic_negate",
    "message0": "not %1",
    "args0": [
      { "type": "input_value", "name": "BOOL", "check": "Boolean" }
    ],
    "output": "Boolean",
    "colour": 210,
    "tooltip": "Negate a boolean",
    "helpUrl": ""
  },
  {
    "type": "logic_boolean",
    "message0": "%1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "BOOL",
        "options": [
          ["true", "TRUE"],
          ["false", "FALSE"]
        ]
      }
    ],
    "output": "Boolean",
    "colour": 210,
    "tooltip": "True or false",
    "helpUrl": ""
  },
  {
    "type": "text_join",
    "message0": "join %1 %2",
    "args0": [
      { "type": "input_value", "name": "A" },
      { "type": "input_value", "name": "B" }
    ],
    "output": "String",
    "colour": 160,
    "tooltip": "Join two texts together",
    "helpUrl": ""
  }
]);

// Generators
javascript.javascriptGenerator.forBlock['math_number'] = function(block, generator) {
  const num = Number(block.getFieldValue('NUM'));
  return [String(num), generator.ORDER_ATOMIC];
};

javascript.javascriptGenerator.forBlock['text'] = function(block, generator) {
  const text = block.getFieldValue('TEXT');
  return [JSON.stringify(text), generator.ORDER_ATOMIC];
};

javascript.javascriptGenerator.forBlock['math_arithmetic'] = function(block, generator) {
  const op = block.getFieldValue('OP');
  const a = generator.valueToCode(block, 'A', generator.ORDER_ATOMIC) || '0';
  const b = generator.valueToCode(block, 'B', generator.ORDER_ATOMIC) || '0';
  const ops = { ADD: '+', MINUS: '-', MULTIPLY: '*', DIVIDE: '/' };
  return [`(${a} ${ops[op]} ${b})`, generator.ORDER_ATOMIC];
};

javascript.javascriptGenerator.forBlock['math_random'] = function(block, generator) {
  const from = generator.valueToCode(block, 'FROM', generator.ORDER_ATOMIC) || '1';
  const to = generator.valueToCode(block, 'TO', generator.ORDER_ATOMIC) || '10';
  return [`runtime.random(${from}, ${to})`, generator.ORDER_FUNCTION_CALL];
};

javascript.javascriptGenerator.forBlock['logic_compare'] = function(block, generator) {
  const op = block.getFieldValue('OP');
  const a = generator.valueToCode(block, 'A', generator.ORDER_ATOMIC) || '0';
  const b = generator.valueToCode(block, 'B', generator.ORDER_ATOMIC) || '0';
  const ops = { EQ: '===', NEQ: '!==', LT: '<', LTE: '<=', GT: '>', GTE: '>=' };
  return [`(${a} ${ops[op]} ${b})`, generator.ORDER_RELATIONAL];
};

javascript.javascriptGenerator.forBlock['logic_operation'] = function(block, generator) {
  const op = block.getFieldValue('OP');
  const a = generator.valueToCode(block, 'A', generator.ORDER_ATOMIC) || 'false';
  const b = generator.valueToCode(block, 'B', generator.ORDER_ATOMIC) || 'false';
  const ops = { AND: '&&', OR: '||' };
  return [`(${a} ${ops[op]} ${b})`, generator.ORDER_LOGICAL_AND];
};

javascript.javascriptGenerator.forBlock['logic_negate'] = function(block, generator) {
  const bool = generator.valueToCode(block, 'BOOL', generator.ORDER_ATOMIC) || 'false';
  return [`!(${bool})`, generator.ORDER_LOGICAL_NOT];
};

javascript.javascriptGenerator.forBlock['logic_boolean'] = function(block, generator) {
  const val = block.getFieldValue('BOOL') === 'TRUE' ? 'true' : 'false';
  return [val, generator.ORDER_ATOMIC];
};

javascript.javascriptGenerator.forBlock['text_join'] = function(block, generator) {
  const a = generator.valueToCode(block, 'A', generator.ORDER_ATOMIC) || '""';
  const b = generator.valueToCode(block, 'B', generator.ORDER_ATOMIC) || '""';
  return [`String(${a}) + String(${b})`, generator.ORDER_ADDITION];
};
