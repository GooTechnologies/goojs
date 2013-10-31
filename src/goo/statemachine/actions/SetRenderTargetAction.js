define([
	'goo/statemachine/actions/Action',
	'goo/entities/components/PortalComponent',
	'goo/entities/systems/PortalSystem',
	'goo/math/Vector3',
	'goo/entities/components/CameraComponent',
	'goo/renderer/Camera',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib'
],
/** @lends */
function(
	Action,
	PortalComponent,
	PortalSystem,
	Vector3,
	CameraComponent,
	Camera,
	Material,
	ShaderLib
) {
	"use strict";

	function SetRenderTargetAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetRenderTargetAction.prototype = Object.create(Action.prototype);
	SetRenderTargetAction.prototype.constructor = SetRenderTargetAction;

	SetRenderTargetAction.external = {
		name: 'Set Render Target',
		description: 'Renders what a camera sees on the current entity\'s texture',
		parameters: [{
			name: 'Camera',
			key: 'cameraEntityRef',
			type: 'cameraEntity',
			description: 'Camera to use as source',
			'default': null
		}],
		transitions: []
	};

	SetRenderTargetAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();

		// add portal system if it's not already added
		var world = entity._world;
		if (!world.getSystem('PortalSystem')) {
			var renderingSystem = world.getSystem('RenderSystem');
			var renderer = world.gooRunner.renderer;
			world.setSystem(new PortalSystem(renderer, renderingSystem));
		}

		var cameraEntity = world.entityManager.getEntityByName(this.cameraEntityRef);
		var camera = cameraEntity.cameraComponent.camera;

		var portalMaterial = Material.createMaterial(ShaderLib.textured, '');

		this.oldMaterials = entity.meshRendererComponent.materials;
		entity.meshRendererComponent.materials = [portalMaterial];

		var portalComponent = new PortalComponent(camera, 500, { preciseRecursion: true });
		entity.setComponent(portalComponent);
	};

	SetRenderTargetAction.prototype.cleanup = function (fsm) {
		var entity = fsm.getOwnerEntity();
		entity.meshRendererComponent.materials = this.oldMaterials;
	};

	return SetRenderTargetAction;
});