define([
	'goo/entities/systems/System',
	'goo/entities/World'
],
/** @lends */
function (
	System,
	World
) {
	'use strict';

	/**
	 * @class Processes all entities with animation components, updating the animations
	 * @extends System
	 */
	function AnimationSystem() {
		System.call(this, 'AnimationSystem', ['AnimationComponent']);
	}

	AnimationSystem.prototype = Object.create(System.prototype);

	AnimationSystem.prototype.process = function () {
		for (var i = 0; i < this._activeEntities.length; i++) {
			var entity = this._activeEntities[i];
			var animationComponent = entity.animationComponent;
			animationComponent.update(World.time);
			animationComponent.apply(entity.transformComponent);
			animationComponent.postUpdate();
		}
	};

	AnimationSystem.prototype.pause = function () {
		this.passive = true;
		//! AT: why loop like this? why just here? does 'len' stand for 'length'? the length of the array remains the same
		var len = this._activeEntities.length;
		while (len--) {
			this._activeEntities[len].animationComponent.pause();
		}
	};

	AnimationSystem.prototype.stop = function () {
		this.passive = true;
		for (var i = 0; i < this._activeEntities.length; i++) {
			var entity = this._activeEntities[i];
			entity.animationComponent.stop();
		}
	};

	AnimationSystem.prototype.resume = function () {
		this.passive = false;
		for (var i = 0; i < this._activeEntities.length; i++) {
			var entity = this._activeEntities[i];
			entity.animationComponent.resume();
		}
	};

	return AnimationSystem;
});