define(['goo/statemachine/actions/Action'],
/** @lends */
function(Action) {
	"use strict";

	function SetLightRangeAction(settings) {
		settings = settings || {};
		this.everyFrame = settings.everyFrame || false;

		this.entity = settings.entity || null;
		this.range = settings.range || 100;
	}

	SetLightRangeAction.prototype = Object.create(Action.prototype);

	SetLightRangeAction.external = {};
	SetLightRangeAction.external.parameters = [
		{
			name: 'Entity',
			key: 'entity',
			type: 'entity',
			description: 'Light entity'
		},
		{
			name: 'Range',
			key: 'range',
			type: 'float',
			description: 'Light range',
			'default': 100,
			min: 0
		}
	];

	SetLightRangeAction.external.transitions = [
	];

	SetLightRangeAction.prototype._run = function(/*fsm*/) {
		if (this.entity &&
			this.entity.lightComponent &&
			this.entity.lightComponent.light) {
			this.entity.lightComponent.light.range = this.range;
		}
	};

	return SetLightRangeAction;
});