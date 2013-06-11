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

	AnimationSystem.prototype.process = function (entities, tpf) {
		for (var i = 0; i < entities.length; i++) {
			entities[i].animationComponent.update(tpf);
		}
	};

	return AnimationSystem;
});