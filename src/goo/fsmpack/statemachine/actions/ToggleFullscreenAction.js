define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/util/GameUtils'
], function (
	Action,
	GameUtils
) {
	'use strict';

	function ToggleFullscreenAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	ToggleFullscreenAction.prototype = Object.create(Action.prototype);
	ToggleFullscreenAction.prototype.constructor = ToggleFullscreenAction;

	ToggleFullscreenAction.external = {
		name: 'Toggle Fullscreen',
		type: 'display',
		description: 'Toggles fullscreen on/off',
		parameters: [],
		transitions: []
	};

	ToggleFullscreenAction.prototype.enter = function (/*fsm*/) {
		GameUtils.toggleFullScreen();
	};

	return ToggleFullscreenAction;
});