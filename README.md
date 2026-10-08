# CodeBlock

**Block-based GameMaker** – create games with visual blocks, play them instantly, compile and download.

## Features

- Visual block editor (powered by Blockly)
- Categories: Motion, Looks, Events, Control, Sensing, Operators, Variables
- Live stage with real-time preview
- Play / Stop controls
- Compile to JavaScript
- Download as:
  - Standalone HTML game
  - Project file (`.codeblock`)
  - Pure JavaScript
- Save & Load projects
- Dark modern UI

## How to use

1. Open the site (or open `index.html` locally)
2. Drag blocks from the toolbox on the left
3. Connect them under a **when ⚑ clicked** block
4. Press **Play** to run on the stage
5. Press **Download** to export your game

## Keyboard shortcuts

- `Ctrl + Enter` → Play

## Project structure

```
CodeBlock/
├── index.html
├── css/
│   ├── main.css
│   ├── editor.css
│   └── play.css
├── js/
│   ├── app.js
│   ├── editor.js
│   ├── runtime.js
│   ├── compile.js
│   ├── download.js
│   ├── utils.js
│   └── blocks/
│       ├── motion.js
│       ├── looks.js
│       ├── events.js
│       ├── control.js
│       ├── sensing.js
│       ├── operators.js
│       └── variables.js
└── README.md
```

## Tech stack

- Vanilla JavaScript
- Blockly (visual programming)
- HTML5 Canvas (stage)
- No build step required – works directly on GitHub Pages

## License

MIT
