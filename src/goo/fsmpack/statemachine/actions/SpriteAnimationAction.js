var Action = require('./Action');

function SpriteAnimationAction(/*id, settings*/) {
	Action.apply(this, arguments);
	this.completed = false;
}
SpriteAnimationAction.prototype = Object.create(Action.prototype);
SpriteAnimationAction.prototype.constructor = SpriteAnimationAction;

SpriteAnimationAction.external = {
	key: 'spriteAnimation',
	name: 'Sprite Animation action',
	type: 'texture',
	description: 'Animates a texture spritesheet over time.',
	canTransition: false,
	parameters: [{
		name: 'Tiling',
		key: 'tiling',
		type: 'vec2',
		description: 'The number of sprites in X and Y directions.',
		'default': [8, 8]
	}, {
		name: 'Start tile',
		key: 'startTile',
		type: 'int',
		description: 'Initial tile for the animation. 0 is the first one and numTiles-1 is the last one.',
		'default': 0
	}, {
		name: 'End tile',
		key: 'endTile',
		type: 'int',
		description: 'End tile for the animation. Set to -1 to indicate the last tile.',
		'default': -1
	}, {
		name: 'Animation time',
		key: 'animationTime',
		type: 'float',
		min: 1e-6,
		description: 'The time it should take for the animation to cycle through all the tiles once.',
		'default': 1
	}, {
		name: 'Loops',
		key: 'loops',
		type: 'int',
		description: 'The number times to loop through the tiles before the animation is complete. Set to -1 to animate indefinitely.',
		min: -1,
		'default': -1
	}],
	transitions: [{
		key: 'complete',
		description: 'State to transition to when the animation completes.'
	}]
};

SpriteAnimationAction.getTransitionLabel = function (/*transitionKey, actionConfig*/) {
	return 'Sprite Animation complete';
};

SpriteAnimationAction.prototype.enter = function (fsm) {
	var entity = fsm.getOwnerEntity();
	var meshRendererComponent = entity.meshRendererComponent;
	this.texture = null;
	if (!meshRendererComponent || meshRendererComponent.materials.length === 0) {
		return;
	}
	var material = meshRendererComponent.materials[0];
	this.texture = material.getTexture('DIFFUSE_MAP');
	if (!this.texture) {
		return;
	}
	this.startTime = fsm.getTime();
	this.completed = false;

	this.texture.repeat.setDirect(1 / this.tiling[0], 1 / this.tiling[1]);
};

SpriteAnimationAction.prototype.update = function (fsm) {
	if (!this.texture || this.completed) {
		return;
	}

	var time = fsm.getTime() - this.startTime;
	var numTiles = this.tiling[0] * this.tiling[1];
	var endTile = this.endTile;

	// endTile === -1 means the last tile
	if (endTile === -1) {
		endTile = numTiles;
	} else {
		endTile++;
	}

	var t = time / this.animationTime;
	var loop = Math.floor(t);
	t %= 1;

	if (loop >= this.loops && this.loops !== -1) {
		this.completed = true;
		fsm.send(this.transitions.complete);
		return;
	}

	var numViewTiles = endTile - this.startTile;
	var timeOffset = this.startTile / numTiles;
	t *= numViewTiles / numTiles;
	t += timeOffset;

	var tileX = Math.floor(this.tiling[0] * this.tiling[1] * t % this.tiling[1]);
	var tileY = Math.floor((this.tiling[1] * t) % this.tiling[1]);

	this.texture.offset.setDirect(tileX, tileY).mul(this.texture.repeat);
	this.texture.offset.y = -1 / this.tiling[1] - this.texture.offset.y;
};

SpriteAnimationAction.prototype.exit = function (/*fsm*/) {};

module.exports = SpriteAnimationAction;
