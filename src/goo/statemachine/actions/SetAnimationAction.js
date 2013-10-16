define(['goo/statemachine/actions/Action'],
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
		parameters: [{
			name:'Animation',
			key:'animation',
			type:'animstate'
		}, {
			name:'On every frame',
			key:'everyFrame',
			type:'boolean'
		}],
		transitions:[]
	};

	SetAnimationAction.prototype._run = function(fsm) {
		var entity = fsm.getOwnerEntity();
		if (typeof this.animation === 'string' && entity.animationComponent) {
			entity.animationComponent.transitionTo(this.animation);
		}
	};

	return SetAnimationAction;
});