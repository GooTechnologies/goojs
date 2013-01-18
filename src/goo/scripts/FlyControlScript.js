define(
/** @lends FlyControlScript */
function() {
	"use strict";

	/**
	 * Creates a new FlyControlScript
	 * 
	 * @class
	 * @param {ArrayBuffer} data Data to wrap
	 * @param {String} target Type of data ('ArrayBuffer'/'ElementArrayBuffer')
	 * @property {ArrayBuffer} data Data to wrap
	 * @property {String} target Type of data ('ArrayBuffer'/'ElementArrayBuffer')
	 */
	function FlyControlScript(domElement, direction) {
		this.domElement = (domElement !== undefined) ? domElement : document;
		if (domElement) {
			this.domElement.setAttribute('tabindex', -1);
		}

		this.movementSpeed = 10.0;
		this.rollSpeed = 2.0;
		this.movementSpeedMultiplier = 1.0;

		this.mouseStatus = 0;
		this.moveState = {
			up : 0,
			down : 0,
			left : 0,
			right : 0,
			forward : 0,
			back : 0,
			pitchUp : 0,
			pitchDown : 0,
			yawLeft : 0,
			yawRight : 0,
			rollLeft : 0,
			rollRight : 0
		};
		this.moveVector = new Vector3(0, 0, 0);
		this.rotationVector = new Vector3(0, 0, 0);

		this.handleEvent = function(event) {
			if (typeof this[event.type] === 'function') {
				this[event.type](event);
			}
		};

		this.keydown = function(event) {
			if (event.altKey) {
				return;
			}

			// event.preventDefault();
			switch (event.keyCode) {
				case 16: /* shift */
					this.movementSpeedMultiplier = 0.1;
					break;

				case 87: /* W */
					this.moveState.forward = 1;
					break;
				case 83: /* S */
					this.moveState.back = 1;
					break;

				case 65: /* A */
					this.moveState.left = 1;
					break;
				case 68: /* D */
					this.moveState.right = 1;
					break;

				case 82: /* R */
					this.moveState.up = 1;
					break;
				case 70: /* F */
					this.moveState.down = 1;
					break;

				case 38: /* up */
					this.moveState.pitchUp = 1;
					break;
				case 40: /* down */
					this.moveState.pitchDown = 1;
					break;
				case 37: /* left */
					this.moveState.yawLeft = 1;
					break;
				case 39: /* right */
					this.moveState.yawRight = 1;
					break;

				case 81: /* Q */
					this.moveState.rollLeft = 1;
					break;
				case 69: /* E */
					this.moveState.rollRight = 1;
					break;
			}

			this.updateMovementVector();
			this.updateRotationVector();
		};

		this.keyup = function(event) {
			switch (event.keyCode) {
				case 16: /* shift */
					this.movementSpeedMultiplier = 1;
					break;

				case 87: /* W */
					this.moveState.forward = 0;
					break;
				case 83: /* S */
					this.moveState.back = 0;
					break;

				case 65: /* A */
					this.moveState.left = 0;
					break;
				case 68: /* D */
					this.moveState.right = 0;
					break;

				case 82: /* R */
					this.moveState.up = 0;
					break;
				case 70: /* F */
					this.moveState.down = 0;
					break;

				case 38: /* up */
					this.moveState.pitchUp = 0;
					break;
				case 40: /* down */
					this.moveState.pitchDown = 0;
					break;

				case 37: /* left */
					this.moveState.yawLeft = 0;
					break;
				case 39: /* right */
					this.moveState.yawRight = 0;
					break;

				case 81: /* Q */
					this.moveState.rollLeft = 0;
					break;
				case 69: /* E */
					this.moveState.rollRight = 0;
					break;

			}

			this.updateMovementVector();
			this.updateRotationVector();
		};

		this.mousedown = function(event) {
			if (this.domElement !== document) {
				this.domElement.focus();
			}

			event.preventDefault();
			event.stopPropagation();

			this.mouseDownX = event.pageX;
			this.mouseDownY = event.pageY;
			this.mouseStatus++;
		};

		this.mousemove = function(event) {
			if (this.mouseStatus > 0) {
				this.moveState.yawLeft = event.pageX - this.mouseDownX;
				this.moveState.pitchDown = event.pageY - this.mouseDownY;

				this.updateRotationVector();

				this.mouseDownX = event.pageX;
				this.mouseDownY = event.pageY;
			}
		};

		this.mouseup = function(event) {
			event.preventDefault();
			event.stopPropagation();

			this.mouseStatus--;
			this.moveState.yawLeft = this.moveState.pitchDown = 0;

			this.updateRotationVector();
		};

		this.updateMovementVector = function() {
			var forward = (this.moveState.forward || (this.autoForward && !this.moveState.back)) ? 1 : 0;

			this.moveVector.x = (-this.moveState.left + this.moveState.right);
			this.moveVector.y = (-this.moveState.down + this.moveState.up);
			this.moveVector.z = (-forward + this.moveState.back);
		};

		this.updateRotationVector = function() {
			this.rotationVector.x = (-this.moveState.pitchDown + this.moveState.pitchUp);
			this.rotationVector.y = (-this.moveState.yawRight + this.moveState.yawLeft);
			this.rotationVector.z = (-this.moveState.rollRight + this.moveState.rollLeft);
		};

		this.getContainerDimensions = function() {
			if (this.domElement != document) {
				return {
					size : [this.domElement.offsetWidth, this.domElement.offsetHeight],
					offset : [this.domElement.offsetLeft, this.domElement.offsetTop]
				};
			} else {
				return {
					size : [window.innerWidth, window.innerHeight],
					offset : [0, 0]
				};
			}
		};

		function bind(scope, fn) {
			return function() {
				fn.apply(scope, arguments);
			};
		}

		this.domElement.addEventListener('mousemove', bind(this, this.mousemove), false);
		this.domElement.addEventListener('mousedown', bind(this, this.mousedown), false);
		this.domElement.addEventListener('mouseup', bind(this, this.mouseup), false);

		this.domElement.addEventListener('keydown', bind(this, this.keydown), false);
		this.domElement.addEventListener('keyup', bind(this, this.keyup), false);

		this.updateMovementVector();
		this.updateRotationVector();
	}

	FlyControlScript.prototype.run = function(camera, tpf) {
		var moveMult = tpf * this.movementSpeed * this.movementSpeedMultiplier;
		var rotMult = tpf * this.rollSpeed * this.movementSpeedMultiplier;

		var loc = new Vector3();
		if (this.moveVector.z === 1) {
			loc.add(camera._direction);
		} else if (this.moveVector.z === -1) {
			loc.sub(camera._direction);
		}
		if (this.moveVector.x === 1) {
			loc.add(camera._left);
		} else if (this.moveVector.x === -1) {
			loc.sub(camera._left);
		}
		loc.y = 0;
		loc.normalize();
		player.acceleration.set(loc).mul(moveMult);

		// transform.rotation.x += this.rotationVector.x * rotMult;
		// transform.rotation.y += this.rotationVector.y * rotMult;
		// transform.rotation.z += this.rotationVector.z * rotMult;

		camera.onFrameChange();

		if (this.mouseStatus > 0) {
			this.moveState.yawLeft = 0;
			this.moveState.pitchDown = 0;
			this.updateRotationVector();
		}
	};

	return FlyControlScript;
});