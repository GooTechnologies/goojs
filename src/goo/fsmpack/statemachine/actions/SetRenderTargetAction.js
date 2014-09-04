define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/entities/components/PortalComponent',
	'goo/entities/systems/PortalSystem',
	'goo/math/Vector3',
	'goo/entities/components/CameraComponent',
	'goo/renderer/Camera',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib'
],
/** @lends */
function (
	Action,
	PortalComponent,
	PortalSystem,
	Vector3,
	CameraComponent,
	Camera,
	Material,
	ShaderLib
) {
	'use strict';

	function SetRenderTargetAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetRenderTargetAction.prototype = Object.create(Action.prototype);
	SetRenderTargetAction.prototype.constructor = SetRenderTargetAction;

	SetRenderTargetAction.external = {
		name: 'Set Render Target',
		type: 'texture',
		description: 'Renders what a camera sees on the current entity\'s texture',
		parameters: [{
			name: 'Camera',
			key: 'cameraEntityRef',
			type: 'camera',
			description: 'Camera to use as source',
			'default': null
		}],
		transitions: []
	};

	SetRenderTargetAction.prototype.ready = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var world = entity._world;
		if (!world.getSystem('PortalSystem')) {
			var renderSystem = world.getSystem('RenderSystem');
			var renderer = world.gooRunner.renderer;
			world.setSystem(new PortalSystem(renderer, renderSystem));
		}
	};

	SetRenderTargetAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var world = entity._world;

		var cameraEntity = world.entityManager.getEntityById(this.cameraEntityRef);

		if (!cameraEntity || !cameraEntity.cameraComponent || !cameraEntity.cameraComponent.camera) { return; }
		var camera = cameraEntity.cameraComponent.camera;

		var portalMaterial = new Material(ShaderLib.textured);

		if (!entity.meshRendererComponent) { return; }
		this.oldMaterials = entity.meshRendererComponent.materials;
		entity.meshRendererComponent.materials = [portalMaterial];

		var portalComponent = new PortalComponent(camera, 500, { preciseRecursion: true });
		entity.setComponent(portalComponent);
	};

	SetRenderTargetAction.prototype.cleanup = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (this.oldMaterials) {
			entity.meshRendererComponent.materials = this.oldMaterials;
		}

		this.oldMaterials = null;

		entity.clearComponent('portalComponent');

		// would remove the entire system, but the engine does not support that
	};

	return SetRenderTargetAction;
});