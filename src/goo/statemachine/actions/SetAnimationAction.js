define(['goo/statemachine/actions/Action'],
/** @lends */
function(
	Action
	) {
	"use strict";

	function SetAnimationAction(settings) {
		settings = settings || {};
		this.everyFrame = settings.everyFrame || false;

		this.entity = settings.entity || null;
		this.animation = settings.animation || null;
	}

	SetAnimationAction.prototype = Object.create(Action.prototype);

	SetAnimationAction.external = [
		{
			name: 'Entity',
			key: 'entity',
			type: 'entity'
		},
		{
			name:'Animation',
			key:'animation',
			type:'string'
		}];

	SetAnimationAction.prototype._run = function(/*fsm*/) {
		if (this.entity !== null && this.animation !== null && this.entity.animationComponent) {
			this.entity.animationComponent.animationManager.getBaseAnimationLayer().doTransition(this.animation);
		}
	};

	return SetAnimationAction;
});