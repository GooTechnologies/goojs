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
		this.entities = null;
	}

	AnimationSystem.prototype = Object.create(System.prototype);

	AnimationSystem.prototype.process = function (entities) {
		this.entities = entities;
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var animationComponent = entity.animationComponent;
			animationComponent.update(World.time);
			animationComponent.apply(entity.transformComponent);
			animationComponent.postUpdate();
		}
	};

	AnimationSystem.prototype.pause = function () {
		for (var i = 0; i < this.entities.length; i++) {
			var entity = this.entities[i];
			entity.animationComponent.pause();
		}
	};

	AnimationSystem.prototype.resume = function () {
		for (var i = 0; i < this.entities.length; i++) {
			var entity = this.entities[i];
			entity.animationComponent.resume();
		}
	};

	return AnimationSystem;
});