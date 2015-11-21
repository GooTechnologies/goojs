var Action = require('../../../fsmpack/statemachine/actions/Action');
var SystemBus = require('../../../entities/SystemBus');
var Renderer = require('../../../renderer/Renderer');

	'use strict';

	function SwitchCameraAction(/*id, settings*/) {
		Action.apply(this, arguments);
		this._camera = null;
	}

	SwitchCameraAction.prototype = Object.create(Action.prototype);
	SwitchCameraAction.prototype.constructor = SwitchCameraAction;

	SwitchCameraAction.external = {
		name: 'Switch Camera',
		type: 'camera',
		description: 'Switches to a selected camera',
		parameters: [{
			name: 'Camera',
			key: 'cameraEntityRef',
			type: 'camera',
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
		var cameraEntity = world.entityManager.getEntityById(this.cameraEntityRef);
		if (cameraEntity && cameraEntity.cameraComponent) {
			SystemBus.emit('goo.setCurrentCamera', {
				camera: cameraEntity.cameraComponent.camera,
				entity: cameraEntity
			});
		}
	};

	SwitchCameraAction.prototype.cleanup = function (/*fsm*/) {
	};

	module.exports = SwitchCameraAction;