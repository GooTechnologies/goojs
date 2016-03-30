define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/math/Vector3'
], function (
	Action,
	Vector3
) {
	'use strict';

	function SpriteAnimationAction(/*id, settings*/) {
		Action.apply(this, arguments);
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
			key: 'tiling',
			type: 'vec2',
			description: 'The number of sprites in X and Y directions.',
			'default': [1, 1]
		}, {
			key: 'animationTime',
			type: 'float',
			description: 'The time it should take for the animation to cycle through all the frames once.',
			'default': 1
		}],
		transitions: []
	};

	SpriteAnimationAction.prototype.enter = function (fsm) {
	};

	SpriteAnimationAction.prototype.update = function (fsm) {
	};

	SpriteAnimationAction.prototype.exit = function (fsm) {
	};

	return SpriteAnimationAction;
});