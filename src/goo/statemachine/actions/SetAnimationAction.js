define(['goo/statemachine/actions/Action'],
/** @lends */
function(
	Action
	) {
	"use strict";

	function SetAnimationAction(settings) {
		Action.apply(this, arguments);
		this.everyFrame = false;
	}

	SetAnimationAction.prototype = Object.create(Action.prototype);


	SetAnimationAction.prototype.configure = function(settings) {
		var parameters = SetAnimationAction.external.parameters;

		for (var pi = 0; pi < parameters.length; pi++) {
			var parameter = parameters[pi];

			if (settings[parameter.key] != null)
				this[parameter.key] = settings[parameter.key];
			else 
				this[parameter.key] = parameter['default'];
		}
	};



	SetAnimationAction.external = {
		parameters: [
		{
			name:'Animation',
			key:'animation',
			type:'string'
		},
		{
			name:'On every frame',
			key:'everyFrame',
			type:'boolean'
		}

		],

		transitions:[]
	};

	SetAnimationAction.prototype._run = function(fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity != null && typeof this.animation === 'string' && entity.animationComponent) {
			entity.animationComponent.transitionTo(this.animation);
		}
	};

	return SetAnimationAction;
});