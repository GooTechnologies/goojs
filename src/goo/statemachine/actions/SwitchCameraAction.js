define([
	'goo/statemachine/actions/Action',
	'goo/entities/SystemBus'
],
/** @lends */
function(
	Action,
	SystemBus
) {
	"use strict";

	function SwitchCameraAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SwitchCameraAction.prototype = Object.create(Action.prototype);
	SwitchCameraAction.prototype.constructor = SwitchCameraAction;

	SwitchCameraAction.external = {
		parameters: [{
			name: 'Camera',
			key: 'cameraEntity',
			type: 'cameraEntity',  // an entity with a camera component
			description: 'Camera to switch to',
			'default': null
		}],
		transitions: []
	};

	SwitchCameraAction.prototype._run = function(/*fsm*/) {
		if (this.cameraEntity && this.cameraEntity.cameraComponent) {
			SystemBus.emit('goo.setCurrentCamera', this.cameraEntity.cameraComponent.camera);
		}
	};

	return SwitchCameraAction;
});