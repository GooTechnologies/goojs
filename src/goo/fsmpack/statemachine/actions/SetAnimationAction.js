define(['goo/fsmpack/statemachine/actions/Action'], function (
	Action
	) {
	'use strict';

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
			name: 'Animation',
			key: 'animation',
			type: 'animation'
		}],
		transitions: [{
			key: 'complete',
			name: 'On completion',
			description: 'State to transition to when the target animation completes'
		}]
	};

	SetAnimationAction.prototype.update = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var that = this;
		if (typeof this.animation === 'string' && entity.animationComponent) {
			entity.animationComponent.transitionTo(this.animation, true, function () {
				fsm.send(that.transitions.complete);
			});
		}
	};

	return SetAnimationAction;
});