define([
	'goo/math/Vector3',
	'goo/math/Matrix3x3',
	'goo/math/MathUtils'
],
	/** @lends */
	function (
	Vector3,
	Matrix3x3,
	MathUtils
) {
		"use strict";

		/**
		 * @class Enables mouse rotation of an entity.
		 * @param {Object} [properties]
		 * @param {Element} [properties.domElement] Element to add mouse listeners to
		 * @param {number} [properties.turnSpeedHorizontal=0.01]
		 * @param {number} [properties.turnSpeedVertical=0.01]
		 * @param {number} [properties.dragButton=-1] Only drag with button with this code (-1 to enable all)
		 * @param {Vector3} [properties.worldUpVector=Vector3(0,1,0)]
		 * @param {Vector3} [properties.localLeftVector=Vector3(-1,0,0)]
		 */
		function MouseLookControlScript (properties) {

			properties = properties || {};

			this.name = 'MouseLookControlScript';

			this.domElement = properties.domElement || document;

			this.turnSpeedHorizontal = !isNaN(properties.turnSpeedHorizontal) ? properties.turnSpeed : 0.01;
			this.turnSpeedVertical = !isNaN(properties.turnSpeedVertical) ? properties.turnSpeed : 0.01;

			this.dragOnly = properties.dragOnly !== undefined ? properties.dragOnly === true : true;
			this.dragButton = !isNaN(properties.dragButton) ? properties.dragButton : -1;

			this.worldUpVector = properties.worldUpVector || new Vector3(0, 1, 0);
			this.localLeftVector = properties.localLeftVector || new Vector3(-1, 0, 0);

			// XXX: might be neat to instead set a lookat point and then slerp to it over time?
			// this.localFwdVector = properties.localFwdVector || new Vector3(0, 0, -1);
			// this.slerpFactor = !isNaN(properties.slerpFactor) ? properties.slerpFactor : 0.8;
			// this.restAngle = !isNaN(properties.restAngle) ? properties.restAngle : 0.01;
			// this.rest = true;
			// this.calcQuat1 = new Quaternion();
			// this.calcQuat2 = new Quaternion();
			// this.direction = new Vector3(this.localFwdVector);

			this.onRun = properties.onRun;

			this.maxAscent = (properties.maxAscent !== undefined) ? properties.maxAscent : 89.95 * MathUtils.DEG_TO_RAD;
			this.minAscent = (properties.minAscent !== undefined) ? properties.minAscent : -89.95 * MathUtils.DEG_TO_RAD;

			this.calcVector = new Vector3();
			this.calcMat1 = new Matrix3x3();
			this.calcMat2 = new Matrix3x3();
			this.rotX = 0.0;
			this.rotY = 0.0;

			this.resetMouseState();
			this.setupMouseControls();
		}

		MouseLookControlScript.prototype.resetMouseState = function () {
			this.mouseState = {
				buttonDown : false,
				lastX : NaN,
				lastY : NaN,
				dX : 0,
				dY : 0
			};
		};

		MouseLookControlScript.prototype.updateButtonState = function (event, down) {
			if (this.domElement !== document) {
				this.domElement.focus();
			}


			if (this.dragOnly && (this.dragButton === -1 || this.dragButton === event.button)) {
				this.mouseState.buttonDown = down;

				event.preventDefault();
			}
		};

		MouseLookControlScript.prototype.updateDeltas = function (event) {
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

		var boundMouseDown, boundMouseMove, boundMouseUp;

		var mousedown = function (event) {
			this.resetMouseState();
			this.updateButtonState(event, true);

			boundMouseMove = mousemove.bind(this);
			boundMouseUp = mouseup.bind(this);

			document.addEventListener('mousemove', boundMouseMove, false);
			document.addEventListener('mouseup', boundMouseUp, false);
		};

		var mousemove = function (event) {
			this.updateDeltas(event);
		};

		var mouseup = function (event) {
			this.updateButtonState(event, false);

			document.removeEventListener('mousemove', boundMouseMove);
			document.removeEventListener('mouseup', boundMouseUp);
		};

		MouseLookControlScript.prototype.setupMouseControls = function () {
			boundMouseDown = mousedown.bind(this);

			this.domElement.addEventListener('mousedown', boundMouseDown, false);
		};

		MouseLookControlScript.prototype.run = function (entity) {
			// grab our transformComponent
			var transformComponent = entity.transformComponent;
			if (!transformComponent) {
				return;
			}
			var transform = transformComponent.transform;

			// XXX: might be neat to instead set a lookat point and then slerp to it over time?
			// if (!this.rest) {
			// // apply transform to localFwdVector
			// transform.rotation.applyPost(this.calcVector.set(this.localFwdVector));
			//
			// // see if we're pointing at/close to our desired look direction
			// var angleDiff = Math.acos(this.calcVector.dot(this.direction));
			// if (angleDiff < this.restAngle) {
			// // pretty close, so stop
			// this.rest = true;
			// } else {
			// // we are not pointed at our desired angle, slerp to it
			// // generate a quat to rotate from current to desired
			// // slerp along it
			// this.calcQuat1.fromRotationMatrix(transform.rotation);
			// this.calcQuat2.fromVectorToVector(this.localFwdVector, this.direction);
			//
			// this.calcQuat1.slerp(this.calcQuat2, this.slerpFactor * entity._world.tpf);
			// this.calcQuat1.toRotationMatrix(transform.rotation);
			//
			// // set our component updated.
			// transformComponent.setUpdated();
			// }
			// }

			// exit early if not dragging, or no movement
			if (this.dragOnly && !this.mouseState.buttonDown || this.mouseState.dX === 0 && this.mouseState.dY === 0) {
				this.mouseState.dX = 0;
				this.mouseState.dY = 0;
				return;
			}

			// speed for this movement...
			var moveMultH = this.turnSpeedHorizontal;
			var moveMultV = this.turnSpeedVertical;

			// apply dx around upVector
			if (this.mouseState.dX !== 0) {
				this.rotX -= moveMultH * this.mouseState.dX;

				//this.calcMat1.fromAngleNormalAxis(this.rotX, this.worldUpVector.x, this.worldUpVector.y, this.worldUpVector.z);

				//Matrix3x3.combine(this.calcMat1, transform.rotation, this.calcMat2);
				//transform.rotation.set(this.calcMat2);
			}
			// apply dy around left vector
			if (this.mouseState.dY !== 0) {
				this.rotY -= moveMultV * this.mouseState.dY;
				if(this.rotY > this.maxAscent) {
					this.rotY = this.maxAscent;
				} else if (this.rotY < this.minAscent) {
					this.rotY = this.minAscent;
				}
				//this.calcMat2.fromAngleNormalAxis(this.rotY, this.localLeftVector.x, this.localLeftVector.y,
				//	this.localLeftVector.z);

				//Matrix3x3.combine(transform.rotation, this.calcMat1, this.calcMat2);
				//transform.rotation.set(this.calcMat2);
			}
			//Matrix3x3.combine(this.calcMat1, thisCalcMat2, transform.rotation);
			transform.rotation.fromAngles(this.rotY, this.rotX, 0.0);

			// set our component updated.
			transformComponent.setUpdated();

			// clear state
			this.mouseState.dX = 0;
			this.mouseState.dY = 0;
		};

		return MouseLookControlScript;
	});