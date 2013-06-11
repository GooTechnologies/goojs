define([
	'goo/animation/AnimationManager',
	'goo/entities/components/Component'
],
/** @lends */
function (
	AnimationManager,
	Component
) {
	"use strict";

	/**
	 * @class Holds the animation data.
	 * @param {AnimationManager} animationManager Animation manager instance
	 */
	function AnimationComponent(animationManager) {
		this.type = 'AnimationComponent';

		this.animationManager = animationManager;
	}

	AnimationComponent.prototype = Object.create(Component.prototype);

	/**
	 * Update animations
	 */
	AnimationComponent.prototype.update = function (tpf) {
		if (this.animationManager) {
			this.animationManager.update(tpf);
		}
	};

	return AnimationComponent;
});