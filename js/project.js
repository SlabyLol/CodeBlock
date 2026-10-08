/**
 * CodeBlock – Project Manager
 * Holds all sprites, stage, and project metadata
 */

class Project {
  constructor() {
    this.name = 'Untitled Project';
    this.sprites = [];
    this.selectedSpriteId = null;
    this.stageBackdrop = '#11151c';
    this.variables = {};
  }

  get selectedSprite() {
    return this.sprites.find(s => s.id === this.selectedSpriteId) || this.sprites[0] || null;
  }

  addSprite(name) {
    const count = this.sprites.length + 1;
    const sprite = new Sprite(name || `Sprite${count}`);
    // Offset new sprites a bit
    sprite.x = (count - 1) * 30;
    sprite.y = (count - 1) * 10;
    this.sprites.push(sprite);
    this.selectedSpriteId = sprite.id;
    return sprite;
  }

  removeSprite(id) {
    if (this.sprites.length <= 1) {
      Utils.log('Cannot delete the last sprite', 'warn');
      return false;
    }
    const idx = this.sprites.findIndex(s => s.id === id);
    if (idx >= 0) {
      this.sprites.splice(idx, 1);
      if (this.selectedSpriteId === id) {
        this.selectedSpriteId = this.sprites[0].id;
      }
      return true;
    }
    return false;
  }

  selectSprite(id) {
    this.selectedSpriteId = id;
  }

  serialize() {
    return {
      name: this.name,
      version: '2.0',
      created: new Date().toISOString(),
      stageBackdrop: this.stageBackdrop,
      variables: this.variables,
      selectedSpriteId: this.selectedSpriteId,
      sprites: this.sprites.map(s => s.serialize())
    };
  }

  static deserialize(data) {
    const p = new Project();
    p.name = data.name || 'Loaded Project';
    p.stageBackdrop = data.stageBackdrop || '#11151c';
    p.variables = data.variables || {};
    p.sprites = (data.sprites || []).map(sd => Sprite.deserialize(sd));
    if (p.sprites.length === 0) {
      p.addSprite('Sprite1');
    }
    p.selectedSpriteId = data.selectedSpriteId || p.sprites[0].id;
    return p;
  }

  newProject() {
    this.name = 'Untitled Project';
    this.sprites = [];
    this.variables = {};
    this.addSprite('Sprite1');
  }
}

window.Project = Project;
