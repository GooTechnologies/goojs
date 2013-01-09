define(['goo/math/Vector3'], function (Vector3) {
	"use strict";

	/**
	 * @name BasicControlScript
	 * @class Simple script to move/rotate an entity
	 * @param {Element} domElement Element to add mouse/key listeners to
	 */
	function BasicControlScript(domElement) {
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

		this.handleEvent = function (event) {
			if (typeof this[event.type] === 'function') {
				this[event.type](event);
			}
		};

		this.keydown = function (event) {
			if (event.altKey) {
				return;
			}

			// event.preventDefault();
			switch (event.keyCode)
			{
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

		this.keyup = function (event) {
			switch (event.keyCode)
			{
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

		this.mousedown = function (event) {
			if (this.domElement !== document) {
				this.domElement.focus();
			}

			event.preventDefault();
			event.stopPropagation();

			this.mouseDownX = event.pageX;
			this.mouseDownY = event.pageY;
			this.mouseStatus = 1;
		};

		this.mousemove = function (event) {
			if (this.mouseStatus > 0) {
				this.moveState.yawLeft = event.pageX - this.mouseDownX;
				this.moveState.pitchDown = event.pageY - this.mouseDownY;

				this.updateRotationVector();

				this.mouseDownX = event.pageX;
				this.mouseDownY = event.pageY;
			}
		};

		this.mouseup = function (event) {
		  if(!this.mouseStatus) return;
			event.preventDefault();
			event.stopPropagation();

			this.mouseStatus = 0;
			this.moveState.yawLeft = this.moveState.pitchDown = 0;

			this.updateRotationVector();
		};

		this.updateMovementVector = function () {
			var forward = (this.moveState.forward || (this.autoForward && !this.moveState.back)) ? 1 : 0;

			this.moveVector.x = (-this.moveState.left + this.moveState.right);
			this.moveVector.y = (-this.moveState.down + this.moveState.up);
			this.moveVector.z = (-forward + this.moveState.back);
		};

		this.updateRotationVector = function () {
			this.rotationVector.x = (-this.moveState.pitchDown + this.moveState.pitchUp);
			this.rotationVector.y = (-this.moveState.yawRight + this.moveState.yawLeft);
			this.rotationVector.z = (-this.moveState.rollRight + this.moveState.rollLeft);
		};

		this.getContainerDimensions = function () {
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
			return function () {
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

	/**
	 * Test on how to expose variables to a tool.
	 *
	 * @returns {Array}
	 */
	BasicControlScript.prototype.externals = function () {
		return [{
			variable : 'movementSpeed',
			type : 'number'
		}, {
			variable : 'rollSpeed',
			type : 'number'
		}];
	};

	BasicControlScript.prototype.run = function (entity) {
		var transformComponent = entity.transformComponent;
		var transform = transformComponent.transform;

		var delta = entity._world.tpf;

		var moveMult = delta * this.movementSpeed * this.movementSpeedMultiplier;
		var rotMult = delta * this.rollSpeed * this.movementSpeedMultiplier;

		// TODO: HACK!
		if (entity.cameraComponent) {
			entity.cameraComponent.camera.translation.x += (this.moveVector.x * moveMult);
			entity.cameraComponent.camera.translation.y += (this.moveVector.y * moveMult);
			entity.cameraComponent.camera.translation.z += (this.moveVector.z * moveMult);
			entity.cameraComponent.camera.onFrameChange();

			return;
		}

		transform.translation.x += (this.moveVector.x * moveMult);
		transform.translation.y += (this.moveVector.y * moveMult);
		transform.translation.z += (this.moveVector.z * moveMult);

		transform.rotation.x += this.rotationVector.x * rotMult;
		transform.rotation.y += this.rotationVector.y * rotMult;
		transform.rotation.z += this.rotationVector.z * rotMult;

		if (this.mouseStatus > 0) {
			this.moveState.yawLeft = 0;
			this.moveState.pitchDown = 0;
			this.updateRotationVector();
		}

		transformComponent.setUpdated();
	};

	return BasicControlScript;
});