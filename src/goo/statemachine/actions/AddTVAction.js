define([
	'goo/statemachine/actions/Action',
	'goo/entities/components/PortalComponent',
	'goo/entities/systems/PortalSystem',
	'goo/math/Vector3',
	'goo/entities/components/CameraComponent',
	'goo/renderer/Camera',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Texture'
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
	ShaderLib,
	Texture
) {
	"use strict";

	function AddTVAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	AddTVAction.prototype = Object.create(Action.prototype);
	AddTVAction.prototype.constructor = AddTVAction;

	AddTVAction.external = {
		parameters: [{
			name: 'Translation',
			key: 'position',
			type: 'position',
			description: 'Position',
			'default': [0, 0, 0]
		}, {
			name: 'LookAt',
			key: 'lookAt',
			type: 'position',
			description: 'Look at point',
			'default': [0, 0, -1]
		}],
		transitions: []
	};

	AddTVAction.prototype._run = function(fsm) {
		var entity = fsm.getOwnerEntity();

		// add portal system if it's not already added
		var world = entity._world;
		if (!world.getSystem('PortalSystem')) {
			var renderingSystem = world.getSystem('RenderSystem');
			var renderer = world.gooRunner.renderer;
			world.setSystem(new PortalSystem(renderer, renderingSystem));
		}

		var camera = new Camera(45, 1, 1, 1000);

		var cameraEntity = world.createEntity('TV camera'); // need to remove this when machine stops

		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.transformComponent.transform.translation.setd(this.position[0], this.position[1], this.position[2]);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(this.lookAt[0], this.lookAt[1], this.lookAt[2]), Vector3.UNIT_Y);
		cameraEntity.addToWorld();

		var portalMaterial = Material.createMaterial(ShaderLib.textured, '');

		entity.meshRendererComponent.materials = [portalMaterial];

		var portalComponent = new PortalComponent(camera, 500, { preciseRecursion: true });
		entity.setComponent(portalComponent);
	};

	return AddTVAction;
});