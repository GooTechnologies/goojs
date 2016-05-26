import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var SystemBus = require('../../../entities/SystemBus');
var Renderer = require('../../../renderer/Renderer');

class SwitchCameraAction extends Action {
	cameraEntityRef: any;
	_camera: any;
	constructor(id: string, options: any){
		super(id, options);
		this._camera = null;
	}

	static external: External = {
		key: 'Switch Camera',
		name: 'Switch Camera',
		type: 'camera',
		description: 'Switches to a selected camera.',
		parameters: [{
			name: 'Camera',
			key: 'cameraEntityRef',
			type: 'camera',
			description: 'Camera to switch to.',
			'default': null
		}],
		transitions: []
	};

	ready (/*fsm*/) {
		this._camera = Renderer.mainCamera; // make this into get activeCamera
	};

	enter (fsm) {
		var world = fsm.getOwnerEntity()._world;
		var cameraEntity = world.entityManager.getEntityById(this.cameraEntityRef);
		if (cameraEntity && cameraEntity.cameraComponent) {
			SystemBus.emit('goo.setCurrentCamera', {
				camera: cameraEntity.cameraComponent.camera,
				entity: cameraEntity
			});
		}
	};

	cleanup (/*fsm*/) {
	};
}

export = SwitchCameraAction;