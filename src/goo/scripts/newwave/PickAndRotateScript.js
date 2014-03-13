require([
	'goo/math/Vector3',
	'goo/scripts/Scripts'
], function (
	Vector3,
	Scripts
) {
	'use strict';

	var externals = {
		name: 'Pick and rotate',
		description: 'Enables pick-drag-rotating entities',
	};

	var PickAndRotateScript = function () {
		var entity, transformComponent, transform, gooRunner;
		var pickedEntity;
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
		
		function mouseDown(event) {
			console.log('Entity is ' + event.entity + ' at ' + event.depth);

			pickedEntity = event.entity;
			mouseState.down = !!event.entity;
		}
		
		function mouseMove(event) {
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
		}
		function mouseUp(event) {
			mouseState.down = false;
		}
		

		// ---
		function setupMouseControls(gooRunner) {
		}

		function setup(_parameters, env) {
			parameters = _parameters;

			var entity = env.getEntity();
			gooRunner = entity._world.gooRunner;

			gooRunner.addEventListener('mousedown', mouseDown);
			gooRunner.renderer.domElement.addEventListener('mousemove', mouseMove);
			gooRunner.renderer.domElement.addEventListener('mouseup', mouseUp);
		}

		function update(parameters, env) {
			if (moveVector.equals(Vector3.ZERO)) { return; }

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

		function cleanup(_parameters, env) {
			env.domElement.removeEventListener('mousemove', mouseMove, false);
			env.domElement.removeEventListener('mouseup', mouseUp, false);
			gooRunner.removeEventListener('mousedown', mouseDown);
		}

		return {
			setup: setup,
			update: update,
			cleanup: cleanup,
			externals: externals
		};
	};
	Scripts.register(externals, PickAndRotateScript);
});