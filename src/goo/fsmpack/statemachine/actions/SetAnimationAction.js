define(['goo/fsmpack/statemachine/actions/Action'],
/** @lends */
function(
	Action
	) {
	"use strict";

	function SetAnimationAction(/*id, settings*/) {
		Action.apply(this, arguments);
		this.everyFrame = false;
	}

	SetAnimationAction.prototype = Object.create(Action.prototype);
	SetAnimationAction.prototype.constructor = SetAnimationAction;

	SetAnimationAction.external = {
		name: 'Set Animation',
		type: 'animation',
		description: 'Transitions to a selected animation',
		parameters: [{
			name:'Animation',
			key:'animation',
			type:'animstate'
		}],
		transitions:[]
	};

	SetAnimationAction.prototype._run = function(fsm) {
		var entity = fsm.getOwnerEntity();
		if (typeof this.animation === 'string' && entity.animationComponent) {
			entity.animationComponent.transitionTo(this.animation, true);
		}
	};

	return SetAnimationAction;
});