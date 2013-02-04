define(['goo/math/Vector', 'goo/math/Vector3', 'goo/math/Matrix3x3'],
	/** @lends MouseLookControlScript */
	function(Vector, Vector3, Matrix3x3) {
		"use strict";

		function MouseLookControlScript(properties) {

			properties = properties || {};

			this.domElement = properties.domElement || document;

			this.turnSpeedHorizontal = !isNaN(properties.turnSpeedHorizontal) ? properties.turnSpeed : 0.5;
			this.turnSpeedVertical = !isNaN(properties.turnSpeedVertical) ? properties.turnSpeed : 0.5;

			this.dragOnly = properties.dragOnly !== undefined ? properties.dragOnly === true : true;
			this.dragButton = !isNaN(properties.dragButton) ? properties.dragButton : -1;

			this.worldUpVector = properties.worldUpVector || new Vector3(0, 1, 0);
			this.localLeftVector = properties.localLeftVector || new Vector3(-1, 0, 0);

			this.onRun = properties.onRun;

			this.mouseState = {
				buttonDown : false,
				lastX : NaN,
				lastY : NaN,
				dX : 0,
				dY : 0
			};

			this.calcVector = new Vector3();
			this.calcMat1 = new Matrix3x3();
			this.calcMat2 = new Matrix3x3();

			this.setupMouseControls();
		}

		MouseLookControlScript.prototype.updateButtonState = function(event, down) {
			if (this.domElement !== document) {
				this.domElement.focus();
			}

			if (this.dragOnly && (this.dragButton == -1 || this.dragButton == event.button)) {
				this.mouseState.buttonDown = down;

				event.preventDefault();
				event.stopPropagation();
			}
		};

		MouseLookControlScript.prototype.updateDeltas = function(event) {
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

		MouseLookControlScript.prototype.setupMouseControls = function() {
			var that = this;
			this.domElement.addEventListener('mousedown', function(event) {
				that.updateButtonState(event, true);
			}, false);

			this.domElement.addEventListener('mouseup', function(event) {
				that.updateButtonState(event, false);
			}, false);

			this.domElement.addEventListener('mousemove', function(event) {
				that.updateDeltas(event);
			}, false);
		};

		MouseLookControlScript.prototype.run = function(entity) {
			// XXX: might be neat to instead set a lookat point and then slerp to it over time?

			// exit early if not dragging, or no movement
			if (this.dragOnly && !this.mouseState.buttonDown || this.mouseState.dX == 0 && this.mouseState.dY == 0) {
				return;
			}

			// grab our transformComponent
			var transformComponent = entity.transformComponent;
			if (!transformComponent) {
				return;
			}
			var transform = transformComponent.transform;

			// speed for this movement...
			var moveMultH = entity._world.tpf * this.turnSpeedHorizontal;
			var moveMultV = entity._world.tpf * this.turnSpeedVertical;

			// apply dx around upVector
			if (this.mouseState.dX != 0) {
				this.calcMat1.fromAngleNormalAxis(moveMultH * -this.mouseState.dX, this.worldUpVector.x, this.worldUpVector.y, this.worldUpVector.z);

				Matrix3x3.combine(transform.rotation, this.calcMat1, this.calcMat2);
				transform.rotation.set(this.calcMat2);
			}

			// apply dy around left vector
			if (this.mouseState.dY != 0) {
				this.calcMat1.fromAngleNormalAxis(moveMultV * this.mouseState.dY, this.localLeftVector.x, this.localLeftVector.y,
					this.localLeftVector.z);

				Matrix3x3.combine(transform.rotation, this.calcMat1, this.calcMat2);
				transform.rotation.set(this.calcMat2);
			}

			// set our component updated.
			transformComponent.setUpdated();

			// clear state
			this.mouseState.dX = 0;
			this.mouseState.dY = 0;
		};

		return MouseLookControlScript;
	});