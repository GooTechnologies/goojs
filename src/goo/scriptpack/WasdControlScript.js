var Vector3 = require('../math/Vector3');
var ScriptUtils = require('../scripts/ScriptUtils');

function WasdControlScript() {
	var entity, transformComponent, transform;
	var _parameters;

	var moveState;
	var bypass = false;

	var fwdVector = new Vector3(0, 0, -1);
	var leftVector = new Vector3(-1, 0, 0);

	var moveVector = new Vector3();
	var calcVector = new Vector3();
	var translation = new Vector3();

	// ---
	function updateMovementVector() {
		moveVector.x = moveState.strafeLeft - moveState.strafeRight;
		moveVector.z = moveState.forward - moveState.back;
	}

	function keyDown(event) {
		if (event.altKey) {	return;	}

		switch (ScriptUtils.keyForCode(event.keyCode)) {
			case _parameters.crawlKey:
				moveState.crawling = true;
				break;

			case _parameters.forwardKey:
				moveState.forward = 1;
				updateMovementVector();
				break;
			case _parameters.backKey:
				moveState.back = 1;
				updateMovementVector();
				break;

			case _parameters.strafeLeftKey:
				moveState.strafeLeft = 1;
				updateMovementVector();
				break;
			case _parameters.strafeRightKey:
				moveState.strafeRight = 1;
				updateMovementVector();
				break;
		}
	}

	function keyUp(event) {
		if (event.altKey) {	return;	}

		switch (ScriptUtils.keyForCode(event.keyCode)) {
			case _parameters.crawlKey:
				moveState.crawling = false;
				break;

			case _parameters.forwardKey:
				moveState.forward = 0;
				updateMovementVector();
				break;
			case _parameters.backKey:
				moveState.back = 0;
				updateMovementVector();
				break;

			case _parameters.strafeLeftKey:
				moveState.strafeLeft = 0;
				updateMovementVector();
				break;
			case _parameters.strafeRightKey:
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

	function setup(parameters, environment) {
		_parameters = parameters;
		environment.moveState = moveState = {
			strafeLeft: 0,
			strafeRight: 0,
			forward: 0,
			back: 0,
			crawling: false
		};

		entity = environment.entity;
		transformComponent = entity.transformComponent;
		transform = transformComponent.transform;
		translation.copy(transform.translation);

		setupKeyControls(environment.domElement);
	}

	function update(parameters, environment) {
		if (!bypass && moveVector.equals(Vector3.ZERO)) {
			return;
		}

		if (!bypass && (parameters.whenUsed && environment.entity !== environment.activeCameraEntity)) {
			return;
		}

		bypass = false;

		// direction of movement in local coords
		calcVector.setDirect(
			fwdVector.x * moveVector.z + leftVector.x * moveVector.x,
			fwdVector.y * moveVector.z + leftVector.y * moveVector.x,
			fwdVector.z * moveVector.z + leftVector.z * moveVector.x
		);
		calcVector.normalize();

		// move speed for this run...
		var moveMult = environment.world.tpf * (moveState.crawling ? parameters.crawlSpeed : parameters.walkSpeed);

		// scale by speed
		calcVector.scale(moveMult);

		// grab orientation of player
		var orient = transform.rotation;

		// reorient our movement to entity space
		calcVector.applyPost(orient);

		// add to our transform
		translation.add(calcVector);
		transform.translation.copy(translation);

		// set our component updated.
		transformComponent.setUpdated();
	}

	function cleanup(parameters, env) {
		env.domElement.removeEventListener('keydown', keyDown, false);
		env.domElement.removeEventListener('keyup', keyUp, false);
	}

	function argsUpdated() {
		bypass = true;
	}

	return {
		setup: setup,
		update: update,
		cleanup: cleanup,
		argsUpdated: argsUpdated
	};
}

WasdControlScript.externals = {
	key: 'WASD',
	name: 'WASD Control',
	description: 'Enables moving via the WASD keys',
	parameters: [{
		key: 'whenUsed',
		type: 'boolean',
		name: 'When Camera Used',
		description: 'Script only runs when the camera to which it is added is being used.',
		'default': true
	}, {
		key: 'crawlKey',
		type: 'string',
		control: 'key',
		'default': 'Shift'
	}, {
		key: 'forwardKey',
		type: 'string',
		control: 'key',
		'default': 'W'
	}, {
		key: 'backKey',
		type: 'string',
		control: 'key',
		'default': 'S'
	}, {
		key: 'strafeLeftKey',
		type: 'string',
		control: 'key',
		'default': 'A'
	}, {
		key: 'strafeRightKey',
		type: 'string',
		control: 'key',
		'default': 'D'
	}, {
		key: 'walkSpeed',
		type: 'int',
		control: 'slider',
		'default': 10,
		min: 1,
		max: 100,
		exponential: true
	}, {
		key: 'crawlSpeed',
		control: 'slider',
		type: 'int',
		'default': 1,
		min: 0.1,
		max: 10,
		exponential: true
	}]
};

module.exports = WasdControlScript;