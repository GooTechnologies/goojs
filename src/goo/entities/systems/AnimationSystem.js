define([
	'goo/entities/systems/System',
	'goo/entities/World'
],
/** @lends */
function (
	System,
	World
) {
	"use strict";

	/**
	 * @class Processes all entities with animation components, updating the animations
	 */
	function AnimationSystem() {
		System.call(this, 'AnimationSystem', ['AnimationComponent']);
	}

	AnimationSystem.prototype = Object.create(System.prototype);

	AnimationSystem.prototype.process = function (entities) {
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var animComp = entity.animationComponent;
			animComp.update(World.time);
			animComp.apply(entity.transformComponent);
			animComp.postUpdate();
		}
	};

	return AnimationSystem;
});