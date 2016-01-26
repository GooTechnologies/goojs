define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function SetTimeScale(/*id, settings*/) {
		Action.apply(this, arguments);
		this.everyFrame = false;
	}

	SetTimeScale.prototype = Object.create(Action.prototype);
	SetTimeScale.prototype.constructor = SetTimeScale;

	SetTimeScale.external = {
		name: 'Set Animation Time Scale',
		type: 'animation',
		description: 'Sets the time scale for the current animation',
		parameters: [{
			name: 'Scale',
			key: 'scale',
			type: 'number',
			description: 'Scale factor for the animation timer',
			'default': 1
		}],
		transitions: []
	};

	SetTimeScale.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.animationComponent) {
			entity.animationComponent.setTimeScale(this.scale);
		}
	};

	return SetTimeScale;
});