require([
	'goo/entities/GooRunner',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/MeshData',
	'goo/entities/components/MeshRendererComponent',
	'goo/math/Vector3',
	'goo/renderer/light/PointLight',
	'goo/entities/components/LightComponent',
	'goo/scripts/newwave/FPCamControlScript',
	'goo/scripts/WASDControlScript',
	'goo/scripts/ScriptUtils',
	'goo/math/Vector',
	'lib/V'
], function (
	GooRunner,
	Material,
	ShaderLib,
	Camera,
	CameraComponent,
	ScriptComponent,
	MeshData,
	MeshRendererComponent,
	Vector3,
	PointLight,
	LightComponent,
	NewWaveFPCamControlScript,
	WASDControlScript,
	ScriptUtils,
	Vector,
	V
	) {
	'use strict';

	//! schteppe: Outdated. Delete test?

	var external = {
		name: 'Pick and rotate',
		description: 'Enables pick-drag-rotating entities',
		parameters: [{
			key: 'crawlKey',
			type: 'key',
			'default': 16
		}, {
			key: 'forwardKey',
			type: 'key',
			'default': 87
		}, {
			key: 'backKey',
			type: 'key',
			'default': 83
		}, {
			key: 'strafeLeftKey',
			type: 'key',
			'default': 65
		}, {
			key: 'strafeRightKey',
			type: 'key',
			'default': 68
		}, {
			key: 'walkSpeed',
			type: 'key',
			'default': 100
		}, {
			key: 'crawlSpeed',
			type: 'key',
			'default': 10
		}]
	};

	var PickAndRotateScript = function () {
		var entity, transformComponent, transform, gooRunner;
		var parameters;

		var mouseState = {
			x: 0,
			y: 0,
			ox: 0,
			oy: 0,
			dx: 0,
			dy: 0
		};

		var fwdVector = new Vector3(0, 0, -1);
		var leftVector = new Vector3(-1, 0, 0);

		var moveVector = new Vector3();
		var calcVector = new Vector3();

		// ---
		function setupMouseControls(gooRunner) {
			var pickedEntity;

			gooRunner.addEventListener('mousedown', function (event) {
				console.log('Entity is ' + event.entity + ' at ' + event.depth);

				pickedEntity = event.entity;
				mouseState.down = !!event.entity;
			});

			gooRunner.renderer.domElement.addEventListener('mousemove', function (event) {
				mouseState.ox = mouseState.x;
				mouseState.oy = mouseState.y;

				mouseState.x = event.clientX;
				mouseState.y = event.clientY;

				mouseState.dx = mouseState.x - mouseState.ox;
				mouseState.dy = mouseState.y - mouseState.oy;

				if (pickedEntity && mouseState.down) {
					pickedEntity.transformComponent.transform.rotation.fromAngles(mouseState.y / -180, mouseState.x / 180, 0.0);
					pickedEntity.transformComponent.setUpdated();
				}
			});

			gooRunner.renderer.domElement.addEventListener('mouseup', function () {
				mouseState.down = false;
			});
		}

		function setup(_parameters, env) {
			ScriptUtils.fillDefaultValues(_parameters, external.parameters);

			parameters = _parameters;

			var entity = env.getEntity();
			gooRunner = entity._world.gooRunner;

			setupMouseControls(gooRunner);
		}

		function update(parameters, env) {
			if (Vector.equals(moveVector, Vector3.ZERO)) { return; }

			// direction of movement in local coords
			calcVector.set(
				fwdVector.x * moveVector.z + leftVector.x * moveVector.x,
				fwdVector.y * moveVector.z + leftVector.y * moveVector.x,
				fwdVector.z * moveVector.z + leftVector.z * moveVector.x
			);
			calcVector.normalize();

			// move speed for this run...
			var moveMult = entity._world.tpf * moveState.speed;

			// scale by speed
			calcVector.mul(moveMult);

			// grab orientation of player
			var orient = transform.rotation;

			// reorient our movement to entity space
			orient.applyPost(calcVector);

			// add to our transform
			transform.translation.add(calcVector);

			// set our component updated.
			transformComponent.setUpdated();
		}

		function cleanup() {
			parameters.domElement.removeEventListener('keydown', keyDown, false);
			parameters.domElement.removeEventListener('keyup', keyUp, false);
		}

		return {
			setup: setup,
			update: update,
			cleanup: cleanup
		};
	};

	function pickAndRotateScriptDemo() {
		var goo = V.initGoo();

		V.addLights();

		V.addColoredBoxes();

		// add camera
		var camera = new Camera();
		var cameraEntity = goo.world.createEntity(camera, 'CameraEntity', [0, 0, 20]).lookAt([0, 0, 0]).addToWorld();

		// camera control set up
		var scripts = new ScriptComponent();

		// WASD control script to move around
		scripts.scripts.push(new WASDControlScript({
			domElement: goo.renderer.domElement,
			walkSpeed: 25.0,
			crawlSpeed: 10.0
		}));



		var pickAndRotateScript = PickAndRotateScript();
		pickAndRotateScript.parameters = {
			domElement: goo.renderer.domElement
		};
		scripts.scripts.push(pickAndRotateScript);

		cameraEntity.setComponent(scripts);
	}

	pickAndRotateScriptDemo();
});