import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var Camera = require('../../../renderer/Camera');
var BoundingSphere = require('../../../renderer/bounds/BoundingSphere');

var labels = {
	inside: 'On Inside Frustum',
	outside: 'On Outside Frustum'
};

class InFrustumAction extends Action {
	current: boolean;
	cameraEntityRef: any;
	camera: any;
	everyFrame: boolean;

	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'In Frustum',
		name: 'In View',
		type: 'camera',
		description: 'Performs a transition based on whether the entity is in a camera\'s frustum or not.',
		canTransition: true,
		parameters: [{
			name: 'Current camera',
			key: 'current',
			type: 'boolean',
			description: 'Check this to always use the current camera.',
			'default': true
		}, {
			name: 'Camera',
			key: 'cameraEntityRef',
			type: 'camera',
			description: 'Other camera; Will be ignored if the previous option is checked.',
			'default': null
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': true
		}],
		transitions: [{
			key: 'inside',
			description: 'State to transition to if entity is in the frustum.'
		}, {
			key: 'outside',
			description: 'State to transition to if entity is outside the frustum.'
		}]
	};

	static getTransitionLabel: GetTransitionLabelFunc = function (transitionKey, actionConfig){
		return labels[transitionKey];
	};

	checkFrustum (fsm) {
		var entity = fsm.getOwnerEntity();

		if (this.current) {
			if (entity.isVisible) {
				fsm.send(this.transitions.inside);
			} else {
				fsm.send(this.transitions.outside);
			}
		} else {
			var boundingVolume = entity.meshRendererComponent ? entity.meshRendererComponent.worldBound : new BoundingSphere(entity.transformComponent.sync().worldTransform.translation, 0.001);
			if (this.camera.contains(boundingVolume) === Camera.Outside) {
				fsm.send(this.transitions.outside);
			} else {
				fsm.send(this.transitions.inside);
			}
		}
	};

	enter (fsm) {
		if (!this.current) {
			var world = fsm.getOwnerEntity()._world;
			var cameraEntity = world.entityManager.getEntityById(this.cameraEntityRef);
			this.camera = cameraEntity.cameraComponent.camera;
		}

		if (!this.everyFrame) {
			this.checkFrustum(fsm);
		}
	};

	update (fsm) {
		if (this.everyFrame) {
			this.checkFrustum(fsm);
		}
	};
}

export = InFrustumAction;
