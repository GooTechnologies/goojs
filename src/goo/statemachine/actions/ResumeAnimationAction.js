define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function ResumeAnimationAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	ResumeAnimationAction.prototype = Object.create(Action.prototype);
	ResumeAnimationAction.prototype.constructor = ResumeAnimationAction;

	ResumeAnimationAction.external = {
		description: 'Continues playing an animation',
		parameters: [{
			name: 'On all',
			key: 'onAll',
			type: 'boolean',
			description: 'Resume animation on all entities or just one',
			'default': false
		}],
		transitions: []
	};

	ResumeAnimationAction.prototype._run = function(fsm) {
		if (this.onAll) {
			var world = fsm.getWorld();
			var animationSystem = world.getSystem('AnimationSystem');
			animationSystem.resume();
		} else {
			var entity = fsm.getOwnerEntity();
			if (entity.animationComponent) {
				entity.animationComponent.resume();
			}
		}
	};

	return ResumeAnimationAction;
});