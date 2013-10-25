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
		this._camera = null;
	}

	SwitchCameraAction.prototype = Object.create(Action.prototype);
	SwitchCameraAction.prototype.constructor = SwitchCameraAction;

	SwitchCameraAction.external = {
		name: 'Switch Camera',
		description: 'Switches between cameras',
		parameters: [{
			name: 'Camera',
			key: 'cameraEntityRef',
			type: 'cameraEntity',  // an entity with a camera component
			description: 'Camera to switch to',
			'default': null
		}],
		transitions: []
	};

	SwitchCameraAction.prototype._run = function(fsm) {
		var world = fsm.getOwnerEntity()._world;
		var cameraEntity = world.entityManager.getEntityByName(this.cameraEntityRef);
		if (cameraEntity && cameraEntity.cameraComponent) {
			SystemBus.emit('goo.setCurrentCamera', cameraEntity.cameraComponent.camera);
		}
	};

	return SwitchCameraAction;
});