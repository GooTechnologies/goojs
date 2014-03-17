define([
	'goo/math/Vector3',
	'goo/scripts/Scripts',
	'goo/scripts/ScriptUtils'
], function (
	Vector3,
	Scripts,
	ScriptUtils
	) {
	'use strict';

	//! AT: use chars instead of keycodes? depends on how the frontend passes keys
	var externals = {
		name: 'WASD',
		description: 'Enables moving via the WASD keys',
		parameters: [{
			key: 'crawlKey',
			type: 'key',
			'default': 'Shift'
		}, {
			key: 'forwardKey',
			type: 'key',
			'default': 'W'
		}, {
			key: 'backKey',
			type: 'key',
			'default': 'S'
		}, {
			key: 'strafeLeftKey',
			type: 'key',
			'default': 'A'
		}, {
			key: 'strafeRightKey',
			type: 'key',
			'default': 'D'
		}, {
			key: 'walkSpeed',
			type: 'int',
			'default': 100,
			min: 1,
			max: 1000,
			exponential: true,
			control: 'slider'
			
		}, {
			key: 'crawlSpeed',
			type: 'int',
			'default': 10,
			min: 0.1,
			max: 100,
			exponential: true,
			control: 'slider'
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
			speed: 0
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

			switch (ScriptUtils.keyForCode(event.keyCode)) {
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

			switch (ScriptUtils.keyForCode(event.keyCode)) {
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

		function setupKeyControls(domElement) {
			domElement.setAttribute('tabindex', -1);
			domElement.addEventListener('keydown', keyDown, false);
			domElement.addEventListener('keyup', keyUp, false);
		}

		function setup(_parameters, env) {
			parameters = _parameters;
			
			moveState.speed = parameters.walkSpeed;

			entity = env.getEntity();
			transformComponent = entity.transformComponent;
			transform = transformComponent.transform;

			setupKeyControls(env.domElement);
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

		function cleanup(parameters, env) {
			env.domElement.removeEventListener('keydown', keyDown, false);
			env.domElement.removeEventListener('keyup', keyUp, false);
		}

		return {
			setup: setup,
			update: update,
			cleanup: cleanup,
			externals: externals
		};
	};
	Scripts.register(externals, WASDControlScript);

	return WASDControlScript;
});