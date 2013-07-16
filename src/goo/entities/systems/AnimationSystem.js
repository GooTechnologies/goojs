define(['goo/entities/systems/System'],
	/** @lends */
	function (System) {
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
			var pose;
			if(entity.meshDataComponent && entity.meshDataComponent.meshData.currentPose) {
				var pose = entity.meshDataComponent.meshData.currentPose;
			}
			animComp.update(entity._world.time);
			animComp.apply(entity.transformComponent, pose);
			animComp.postUpdate();
		}
	};

	return AnimationSystem;
});