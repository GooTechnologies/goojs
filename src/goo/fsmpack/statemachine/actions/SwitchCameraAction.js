define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/entities/SystemBus',
	'goo/renderer/Renderer'
],
/** @lends */
function(
	Action,
	SystemBus,
	Renderer
) {
	'use strict';

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
			type: 'cameraEntity',
			description: 'Camera to switch to',
			'default': null
		}],
		transitions: []
	};

	SwitchCameraAction.prototype.ready = function (/*fsm*/) {
		this._camera = Renderer.mainCamera;
	};

	SwitchCameraAction.prototype._run = function (fsm) {
		var world = fsm.getOwnerEntity()._world;
		var cameraEntity = world.entityManager.getEntityByName(this.cameraEntityRef);
		if (cameraEntity && cameraEntity.cameraComponent) {
			SystemBus.emit('goo.setCurrentCamera', {
				camera: cameraEntity.cameraComponent.camera,
				entity: cameraEntity
			});
		}
	};

	SwitchCameraAction.prototype.cleanup = function (/*fsm*/) {
		SystemBus.emit('goo.setCurrentCamera', {
			camera: this._camera,
			entity: null
		});
	};

	return SwitchCameraAction;
});