define([
	'goo/math/Vector3',
	'goo/math/Matrix3x3',
	'goo/math/MathUtils',
	'goo/entities/SystemBus'
],
/** @lends */
function(
	Vector3,
	Matrix3x3,
	MathUtils,
	SystemBus
) {
	"use strict";

	/**
	 * @class
	 * @param {Object} [properties]
	 * @param {Element} [properties.domElement] Element to add mouse listeners to
	 * @param {number} [properties.turnSpeedHorizontal=0.01]
	 * @param {number} [properties.turnSpeedVertical=0.01]
	 * @param {number} [properties.dragButton=-1] Only drag with button with this code (-1 to enable all)
	 * @param {Vector3} [properties.worldUpVector=Vector3(0,1,0)]
	 * @param {Vector3} [properties.localLeftVector=Vector3(-1,0,0)]
	 */
	function FlyControlScript(properties) {

		properties = properties || {};

		this.name = 'FlyControlScript';

		this.domElement = properties.domElement || null;

		this.turnSpeedHorizontal = !isNaN(properties.turnSpeedHorizontal) ? properties.turnSpeedHorizontal : 0.005;
		this.turnSpeedVertical = !isNaN(properties.turnSpeedVertical) ? properties.turnSpeedVertical : 0.005;

		this.dragOnly = properties.dragOnly !== undefined ? properties.dragOnly === true : true;
		this.dragButton = !isNaN(properties.dragButton) ? properties.dragButton : 2;
		this.dragToMove = properties.dragToMove !== undefined ? properties.dragToMove === true : true;

		this.worldUpVector = new Vector3(properties.worldUpVector) || new Vector3(0, 1, 0);
		this.localLeftVector = new Vector3(properties.localLeftVector) || new Vector3(-1, 0, 0);

		this.onRun = properties.onRun;

		this.maxAscent = (properties.maxAscent !== undefined) ? properties.maxAscent : 89.95 * MathUtils.DEG_TO_RAD;
		this.minAscent = (properties.minAscent !== undefined) ? properties.minAscent : -89.95 * MathUtils.DEG_TO_RAD;

		this.calcVector = new Vector3();
		this.calcMat1 = new Matrix3x3();
		this.calcMat2 = new Matrix3x3();
		this.rotX = 0.0;
		this.rotY = 0.0;

		this.walkSpeed = !isNaN(properties.walkSpeed) ? properties.walkSpeed : 400.0;
		this.crawlSpeed = !isNaN(properties.crawlSpeed) ? properties.crawlSpeed : 40.0;

		this.fwdVector = properties.fwdVector || new Vector3(0, 0, -1);
		this.leftVector = properties.leftVector || new Vector3(-1, 0, 0);

		this.crawlKey = !isNaN(properties.crawlKey) ? properties.crawlKey : 16;
		this.forwardKey = !isNaN(properties.forwardKey) ? properties.forwardKey : 87;
		this.backKey = !isNaN(properties.backKey) ? properties.backKey : 83;
		this.strafeLeftKey = !isNaN(properties.strafeLeftKey) ? properties.strafeLeftKey : 65;
		this.strafeRightKey = !isNaN(properties.strafeRightKey) ? properties.strafeRightKey : 68;
		this.XZ = properties.XZ || false;

		this.maxSpeed = properties.maxSpeed || 30;

		this.onRun = properties.onRun;

		// XXX: maybe add a lockPlane?

		this.moveState = {
			strafeLeft: 0,
			strafeRight: 0,
			forward: 0,
			back: 0,
			crawling: false
		};

		this.moveVector = new Vector3(0, 0, 0);
		this.calcVector = new Vector3();
		this.baseMultiplier = 1;
		this.movementMultiplier = this.baseMultiplier;

		if (this.domElement) {
			this.setupKeyControls();
		}

		this.resetMouseState();
		if (this.domElement) {
			this.setupMouseControls();
		}
		this.active = false;
		this.currentCameraEntity = null;
		SystemBus.addListener('goo.setCurrentCamera', function(data) {
			this.currentCameraEntity = data.entity;
		}.bind(this));
	}

	FlyControlScript.prototype.updateMovementVector = function() {
		this.moveVector.x = this.moveState.strafeLeft - this.moveState.strafeRight;
		this.moveVector.z = this.moveState.forward - this.moveState.back;
	};

	FlyControlScript.prototype.updateKeys = function(event, down) {
		if (event.altKey) {
			return;
		}

		if (this.dragOnly && !this.mouseState.buttonDown && this.dragToMove) {
			this.movementMultiplier = this.baseMultiplier;
			this.moveState.forward = 0;
			this.moveState.back = 0;
			this.moveState.strafeLeft = 0;
			this.moveState.strafeRight = 0;
			this.updateMovementVector();
			return;
		}

		var update = false;
		switch (event.keyCode) {
			case this.crawlKey:
				this.moveState.crawling = down;
				break;

			case this.forwardKey:
				this.moveState.forward = down ? 1 : 0;
				update = true;
				break;
			case this.backKey:
				this.moveState.back = down ? 1 : 0;
				update = true;
				break;

			case this.strafeLeftKey:
				this.moveState.strafeLeft = down ? 1 : 0;
				update = true;
				break;
			case this.strafeRightKey:
				this.moveState.strafeRight = down ? 1 : 0;
				update = true;
				break;
		}

		if (update) {
			this.updateMovementVector();
		}
	};

	FlyControlScript.prototype.resetMouseState = function() {
		this.mouseState = {
			buttonDown: false,
			lastX: NaN,
			lastY: NaN,
			dX: 0,
			dY: 0
		};
	};

	FlyControlScript.prototype.updateButtonState = function(event, down) {
		if (this.dragOnly && (this.dragButton === -1 || this.dragButton === event.button)) {
			this.mouseState.buttonDown = down;

			event.preventDefault();
		}
	};

	FlyControlScript.prototype.updateDeltas = function(event) {
		if (isNaN(this.mouseState.lastX) || isNaN(this.mouseState.lastY)) {
			this.mouseState.dX = 0;
			this.mouseState.dY = 0;
			this.mouseState.lastX = event.clientX;
			this.mouseState.lastY = event.clientY;
		} else {
			this.mouseState.dX = event.clientX - this.mouseState.lastX;
			this.mouseState.dY = event.clientY - this.mouseState.lastY;
			this.mouseState.lastX = event.clientX;
			this.mouseState.lastY = event.clientY;
		}
	};

	var keydown = function(event) {
		if (!this.active || this.dragToMove && !this.mouseState.buttonDown && this.dragOnly) { return; }
		this.updateKeys(event, true);
	};

	var keyup = function(event) {
		if (!this.active || this.dragToMove && !this.mouseState.buttonDown && this.dragOnly) { return; }
		this.updateKeys(event, false);
	};

	FlyControlScript.prototype.setupKeyControls = function() {
		this.domElement.setAttribute('tabindex', -1);
		if (!this.keydown) {
			this.keydown = keydown.bind(this);
		}
		if (!this.keyup) {
			this.keyup = keyup.bind(this);
		}
		this.domElement.addEventListener('keydown', this.keydown, false);
		this.domElement.addEventListener('keyup', this.keyup, false);
	};

	FlyControlScript.prototype.tearDownKeyControls = function() {
		this.domElement.removeEventListener('keydown', this.keydown, false);
		this.domElement.removeEventListener('keyup', this.keyup, false);
	};

	var mousedown = function(event) {
		if (!this.active) { return; }
		//this.setupKeyControls();
		this.domElement.focus();
		this.resetMouseState();
		this.updateButtonState(event, true);
	};

	var mousemove = function(event) {
		if (!this.active) { return; }
		this.updateDeltas(event);
	};

	var mouseup = function(event) {
		if (!this.active) { return; }
		this.updateButtonState(event, false);
		//this.tearDownKeyControls();
	};

	FlyControlScript.prototype.setupMouseControls = function() {
		var boundMouseDown = mousedown.bind(this);
		var boundMouseMove = mousemove.bind(this);
		var boundMouseUp = mouseup.bind(this);

		this.domElement.addEventListener('mousedown', boundMouseDown, false);
		this.domElement.addEventListener('mousemove', boundMouseMove, false);
		this.domElement.addEventListener('mouseup', boundMouseUp, false);
		this.domElement.addEventListener('mouseout', boundMouseUp, false);

		// Avoid missing the mouseup event because of Chrome bug:
		// https://code.google.com/p/chromium/issues/detail?id=244289
		this.domElement.addEventListener('dragstart', function (event) {
			event.preventDefault();
		}, false);
		this.domElement.oncontextmenu = function() { return false; };
	};

	FlyControlScript.prototype.run = function(entity, tpf, env) {
		this.active = entity === this.currentCameraEntity;
		// grab our transformComponent
		if (env) {
			if (!this.domElement && env.domElement)  {
				this.domElement = env.domElement;
				this.setupMouseControls(); // Mouse down in turn sets up key controls
				this.setupKeyControls();
			}
		}
		var transformComponent = entity.transformComponent;
		if (!transformComponent) {
			return;
		}
		var transform = transformComponent.transform;

		var orient = transform.rotation;
		// REVIEW: This could be done after early return
		orient.toAngles(this.calcVector);
		this.rotY = this.calcVector.x;
		this.rotX = this.calcVector.y;

		// exit early if not dragging, or no movement
		// if (this.dragOnly && !this.mouseState.buttonDown || this.mouseState.dX === 0 && this.mouseState.dY === 0) {
		if (this.dragOnly && !this.mouseState.buttonDown) {
			this.mouseState.dX = 0;
			this.mouseState.dY = 0;
			if (this.dragToMove) {
				this.movementMultiplier = this.baseMultiplier;
				this.moveState.forward = 0;
				this.moveState.back = 0;
				this.moveState.strafeLeft = 0;
				this.moveState.strafeRight = 0;
				this.updateMovementVector();
				return;
			}
		}

		if (this.moveVector.x !== 0 || this.moveVector.z !== 0) {
			this.movementMultiplier += tpf * this.movementMultiplier * 1.0;
			this.movementMultiplier = Math.min(this.movementMultiplier, this.maxSpeed);
		} else {
			this.movementMultiplier = this.baseMultiplier;
		}

		// speed for this movement...
		var moveMultH = this.turnSpeedHorizontal;
		var moveMultV = this.turnSpeedVertical;

		// apply dx around upVector
		if (this.mouseState.dX !== 0) {
			this.rotX -= moveMultH * this.mouseState.dX;
		}
		// apply dy around left vector
		if (this.mouseState.dY !== 0) {
			this.rotY -= moveMultV * this.mouseState.dY;
			if (this.rotY > this.maxAscent)  {
				this.rotY = this.maxAscent;
			} else if (this.rotY < this.minAscent) {
				this.rotY = this.minAscent;
			}
		}
		transform.rotation.fromAngles(this.rotY, this.rotX, 0.0);



		// direction of movement in local coords
		this.calcVector.set(this.fwdVector.x * this.moveVector.z + this.leftVector.x * this.moveVector.x, this.fwdVector.y * this.moveVector.z + this.leftVector.y * this.moveVector.x, this.fwdVector.z * this.moveVector.z + this.leftVector.z * this.moveVector.x);
		this.calcVector.normalize();

		// move speed for this run...
		var actualMovementSpeed = (this.moveState.crawling ? this.crawlSpeed : this.walkSpeed) * this.movementMultiplier;
		var moveMult = entity._world.tpf * actualMovementSpeed;

		// scale by speed
		this.calcVector.mul(moveMult);

		// grab orientation of player
		var orient = transform.rotation;
		// reorient our movement to entity space
		orient.applyPost(this.calcVector);

		if (this.XZ) {
			this.calcVector.data[1] = 0.0;
		}

		// add to our transform
		transform.translation.add(this.calcVector);


		// set our component updated.
		transformComponent.setUpdated();

		// clear state
		this.mouseState.dX = 0;
		this.mouseState.dY = 0;
	};

	return FlyControlScript;
});