define(['goo/math/Vector3', 'goo/math/Matrix3x3'], function (Vector3, Matrix3x3) {
	'use strict';

	/**
	 * Make an entity controllable via mouse and keyboard. WASD keys move the entity towards the back, left,
	 * front and right respectively. Shift causes speed to drop to a tenth. R and F move it up or down. Q and E roll it
	 * towards the left or right. The arrow keys cause the entity to rotate, as does dragging with the mouse.
	 *
	 * @param {Element} domElement Element to add mouse/key listeners to
	 */
	function BasicControlScript (properties) {
		properties = properties || {};
		this.domElement = properties.domElement === undefined ? null : properties.domElement.domElement || properties.domElement;

		this.name = 'BasicControlScript';

		/** The regular speed of the entity.
		 * @type {number}
		 * @default
		 */
		this.movementSpeed = 10.0;
		/** The regular speed of the entity when rolling.
		 * @type {number}
		 * @default
		 */
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
		this.multiplier = new Vector3(1, 1, 1);
		this.rotationMatrix = new Matrix3x3();
		this.tmpVec = new Vector3();

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

		this.keyup = function (event) {
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

		this.mousedown = function (event) {
			if (this.domElement !== document) {
				this.domElement.focus();
			}

			event.preventDefault();

			event = event.touches && event.touches.length === 1 ? event.touches[0] : event;

			this.mouseDownX = event.pageX;
			this.mouseDownY = event.pageY;
			this.mouseStatus = 1;

			document.addEventListener('mousemove', this.mousemove, false);
			document.addEventListener('mouseup', this.mouseup, false);
			document.addEventListener('touchmove', this.mousemove, false);
			document.addEventListener('touchend', this.mouseup, false);
		}.bind(this);

		this.mousemove = function (event) {
			if (this.mouseStatus > 0) {
				event = event.touches && event.touches.length === 1 ? event.touches[0] : event;

				this.moveState.yawLeft = event.pageX - this.mouseDownX;
				this.moveState.pitchDown = event.pageY - this.mouseDownY;

				this.updateRotationVector();

				this.mouseDownX = event.pageX;
				this.mouseDownY = event.pageY;
			}
		}.bind(this);

		this.mouseup = function (event) {
			if (!this.mouseStatus) {
				return;
			}

			event.preventDefault();

			this.mouseStatus = 0;
			this.moveState.yawLeft = this.moveState.pitchDown = 0;

			this.updateRotationVector();

			document.removeEventListener('mousemove', this.mousemove);
			document.removeEventListener('mouseup', this.mouseup);
			document.removeEventListener('touchmove', this.mousemove);
			document.removeEventListener('touchend', this.mouseup);
		}.bind(this);

		this.updateMovementVector = function () {
			var forward = this.moveState.forward || this.autoForward && !this.moveState.back ? 1 : 0;

			this.moveVector.x = -this.moveState.left + this.moveState.right;
			this.moveVector.y = -this.moveState.down + this.moveState.up;
			this.moveVector.z = -forward + this.moveState.back;
		};

		this.updateRotationVector = function () {
			this.rotationVector.x = -this.moveState.pitchDown + this.moveState.pitchUp;
			this.rotationVector.y = -this.moveState.yawRight + this.moveState.yawLeft;
			this.rotationVector.z = -this.moveState.rollRight + this.moveState.rollLeft;
		};

		this.getContainerDimensions = function () {
			if (this.domElement !== document) {
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

		if(this.domElement) {
			this.setupMouseControls();
		}
		this.updateMovementVector();
		this.updateRotationVector();
	}

	BasicControlScript.prototype.setupMouseControls = function() {
		this.domElement.setAttribute('tabindex', -1);
		this.domElement.addEventListener('mousedown', this.mousedown, false);
		this.domElement.addEventListener('touchstart', this.mousedown, false);
		this.domElement.addEventListener('keydown', this.keydown.bind(this), false);
		this.domElement.addEventListener('keyup', this.keyup.bind(this), false);
	};

	//! AT: what is this?!?!
	/*
	 * Test on how to expose variables to a tool.
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

	BasicControlScript.prototype.run = function (entity, tpf, env) {
		if(env) {
			if(!this.domElement && env.domElement) {
				this.domElement = env.domElement;
				this.setupMouseControls();
			}
		}
		var transformComponent = entity.transformComponent;
		var transform = transformComponent.transform;

		var delta = entity._world.tpf;

		var moveMult = delta * this.movementSpeed * this.movementSpeedMultiplier;
		var rotMult = delta * this.rollSpeed * this.movementSpeedMultiplier;

		if (!this.moveVector.equals(Vector3.ZERO) || !this.rotationVector.equals(Vector3.ZERO) || this.mouseStatus > 0) {
			transform.translation.x += this.moveVector.x * moveMult;
			transform.translation.y += this.moveVector.y * moveMult;
			transform.translation.z += this.moveVector.z * moveMult;

			this.tmpVec.x += -this.rotationVector.x * rotMult * this.multiplier.x;
			this.tmpVec.y += this.rotationVector.y * rotMult * this.multiplier.y;
			this.tmpVec.z += this.rotationVector.z * rotMult * this.multiplier.z;
			transform.rotation.fromAngles(this.tmpVec.x, this.tmpVec.y, this.tmpVec.z);

			if (this.mouseStatus > 0) {
				this.moveState.yawLeft = 0;
				this.moveState.pitchDown = 0;
				this.updateRotationVector();
			}

			transformComponent.setUpdated();
		}
	};

	return BasicControlScript;
});