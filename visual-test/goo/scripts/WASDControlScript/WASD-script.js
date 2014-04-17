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
	ScriptUtils,
	Vector,
	V
	) {
	'use strict';

	//! schteppe: Outdated and already covered in FPCamControlScript test. Delete?

	//! AT: use chars instead of keycodes? depends on how the frontend passes keys
	var external = {
		name: 'WASD',
		description: 'Enables moving via the WASD keys',
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

	var WASDControlScript = function () {
		var entity, transformComponent, transform;
		var parameters;

		var moveState = {
			strafeLeft: 0,
			strafeRight: 0,
			forward: 0,
			back: 0,
			crawling: false,
			speed: external.parameters[5]['default']
		};

		var fwdVector = new Vector3(0, 0, -1);
		var leftVector = new Vector3(-1, 0, 0);

		var moveVector = new Vector3();
		var calcVector = new Vector3();

		// ---
		function updateMovementVector() {
			moveVector.x = moveState.strafeLeft - moveState.strafeRight;
			moveVector.z = moveState.forward - moveState.back;
		}

		function keyDown(event) {
			if (event.altKey) {	return;	}

			switch (event.keyCode) {
				case parameters.crawlKey:
					moveState.speed = parameters.crawlSpeed;
					break;

				case parameters.forwardKey:
					moveState.forward = 1;
					updateMovementVector();
					break;
				case parameters.backKey:
					moveState.back = 1;
					updateMovementVector();
					break;

				case parameters.strafeLeftKey:
					moveState.strafeLeft = 1;
					updateMovementVector();
					break;
				case parameters.strafeRightKey:
					moveState.strafeRight = 1;
					updateMovementVector();
					break;
			}
		}

		function keyUp(event) {
			if (event.altKey) {	return;	}

			switch (event.keyCode) {
				case parameters.crawlKey:
					moveState.speed = parameters.walkSpeed;
					break;

				case parameters.forwardKey:
					moveState.forward = 0;
					updateMovementVector();
					break;
				case parameters.backKey:
					moveState.back = 0;
					updateMovementVector();
					break;

				case parameters.strafeLeftKey:
					moveState.strafeLeft = 0;
					updateMovementVector();
					break;
				case parameters.strafeRightKey:
					moveState.strafeRight = 0;
					updateMovementVector();
					break;
			}
		}

		function setupKeyControls() {
			parameters.domElement.setAttribute('tabindex', -1);
			parameters.domElement.addEventListener('keydown', keyDown, false);
			parameters.domElement.addEventListener('keyup', keyUp, false);
		}

		function setup(_parameters, env) {
			ScriptUtils.fillDefaultValues(_parameters, external.parameters);

			parameters = _parameters;

			entity = env.getEntity();
			transformComponent = entity.transformComponent;
			transform = transformComponent.transform;

			setupKeyControls();
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

	function WASDControlScriptDemo() {
		var goo = V.initGoo();

		V.addLights();

		V.addColoredSpheres();

		// add camera
		var camera = new Camera();
		var cameraEntity = goo.world.createEntity(camera, 'CameraEntity', [0, 0, 20]).lookAt([0, 0, 0]).addToWorld();

		// camera control set up
		var scripts = new ScriptComponent();

		var wasdScript = WASDControlScript();
		wasdScript.parameters = {
			domElement: goo.renderer.domElement
		};

		// WASD control script to move around
		scripts.scripts.push(wasdScript);

		// the FPCam script itself that locks the pointer and moves the camera
		var fpScript = NewWaveFPCamControlScript();
		fpScript.parameters = {
			domElement: goo.renderer.domElement
		};
		scripts.scripts.push(fpScript);

		cameraEntity.setComponent(scripts);
	}

	WASDControlScriptDemo();
});