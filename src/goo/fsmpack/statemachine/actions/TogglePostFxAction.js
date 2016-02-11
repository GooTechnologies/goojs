define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function TogglePostFxAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	TogglePostFxAction.prototype = Object.create(Action.prototype);
	TogglePostFxAction.prototype.constructor = TogglePostFxAction;

	TogglePostFxAction.external = {
		name: 'Toggle Post FX',
		type: 'fx',
		description: 'Enabled/disables post fx globally',
		parameters: [{
			name: 'Set Post FX state',
			key: 'enabled',
			type: 'boolean',
			description: 'Set Post FX on/off',
			'default': true
		}],
		transitions: []
	};

	TogglePostFxAction.prototype.update = function (fsm) {
		var renderSystem = fsm.getWorld().gooRunner.renderSystem;
		if (renderSystem) {
			renderSystem.enableComposers(this.enabled);
		}
	};

	return TogglePostFxAction;
});