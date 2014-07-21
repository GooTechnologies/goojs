define(['goo/fsmpack/statemachine/actions/Action'],
/** @lends */
function(Action) {
	'use strict';

	function SetLightRangeAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetLightRangeAction.prototype = Object.create(Action.prototype);

	SetLightRangeAction.prototype.configure = function(settings) {
		this.everyFrame = !!settings.everyFrame;
		this.entity = settings.entity || null;
		this.range = settings.range || 100;
	};

	SetLightRangeAction.external = {
		name: 'Set Light Range',
		description: 'Sets the range of a light',
		parameters: [{
			name: 'Entity',
			key: 'entity',
			type: 'entity',
			description: 'Light entity'
		}, {
			name: 'Range',
			key: 'range',
			type: 'real',
			description: 'Light range',
			'default': 100,
			min: 0
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': true
		}],
		transitions: []
	};

	SetLightRangeAction.prototype._run = function(/*fsm*/) {
		if (this.entity &&
			this.entity.lightComponent &&
			this.entity.lightComponent.light) {
			this.entity.lightComponent.light.range = this.range;
		}
	};

	return SetLightRangeAction;
});