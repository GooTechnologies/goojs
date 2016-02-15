define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/renderer/Camera',
	'goo/renderer/bounds/BoundingSphere'
], function (
	Action,
	Camera,
	BoundingSphere
) {
	'use strict';

	function InFrustumAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	InFrustumAction.prototype = Object.create(Action.prototype);
	InFrustumAction.prototype.constructor = InFrustumAction;

	InFrustumAction.external = {
		key: 'In Frustum',
		name: 'In View',
		type: 'camera',
		description: 'Performs a transition based on whether the entity is in a camera\'s frustum or not',
		canTransition: true,
		parameters: [{
			name: 'Current camera',
			key: 'current',
			type: 'boolean',
			description: 'Check this to always use the current camera',
			'default': true
		}, {
			name: 'Camera',
			key: 'cameraEntityRef',
			type: 'camera',
			description: 'Other camera; Will be ignored if the previous option is checked',
			'default': null
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': true
		}],
		transitions: [{
			key: 'inside',
			name: 'Inside',
			description: 'State to transition to if entity is in the frustum'
		}, {
			key: 'outside',
			name: 'Outside',
			description: 'State to transition to if entity is outside the frustum'
		}]
	};

	InFrustumAction.prototype.enter = function (fsm) {
		if (!this.current) {
			var world = fsm.getOwnerEntity()._world;
			var cameraEntity = world.entityManager.getEntityById(this.cameraEntityRef);
			this.camera = cameraEntity.cameraComponent.camera;
		}
	};

	InFrustumAction.prototype.update = function (fsm) {
		var entity = fsm.getOwnerEntity();

		if (this.current) {
			if (entity.isVisible) {
				fsm.send(this.transitions.inside);
			} else {
				fsm.send(this.transitions.outside);
			}
		} else {
			var boundingVolume = entity.meshRendererComponent ? entity.meshRendererComponent.worldBound : new BoundingSphere(entity.transformComponent.worldTransform.translation, 0.001);
			if (this.camera.contains(boundingVolume) === Camera.Outside) {
				fsm.send(this.transitions.outside);
			} else {
				fsm.send(this.transitions.inside);
			}
		}
	};

	return InFrustumAction;
});