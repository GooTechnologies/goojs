define([
	'goo/math/Vector3',
	'goo/math/Matrix3x3',
	'goo/math/MathUtils',
	'goo/util/GameUtils'
],
	/** @lends */
	function (
	Vector3,
	Matrix3x3,
	MathUtils,
	GameUtils
) {
	'use strict';

	/**
	 * @class Enables mouse rotation of an entity.
	 * @param {Object} [properties]
	 * @param {Element} [properties.domElement] Element to add mouse listeners to
	 * @param {number} [properties.turnSpeedHorizontal=0.01]
	 * @param {number} [properties.turnSpeedVertical=0.01]
	 */
	function FPCamControlScript(properties) {
		properties = properties || {};

		this.name = 'FPCamControlScript';

		this.domElement = properties.domElement || null;

		this.turnSpeedHorizontal = !isNaN(properties.turnSpeedHorizontal) ? properties.turnSpeedHorizontal : 0.01;
		this.turnSpeedVertical = !isNaN(properties.turnSpeedVertical) ? properties.turnSpeedVertical : 0.01;

		this.maxAscent = (properties.maxAscent !== undefined) ? properties.maxAscent : 89.95 * MathUtils.DEG_TO_RAD;
		this.minAscent = (properties.minAscent !== undefined) ? properties.minAscent : -89.95 * MathUtils.DEG_TO_RAD;

		this.calcVector = new Vector3();
		this.rotX = 0.0;
		this.rotY = 0.0;

		this.pointerLocked = false;

		this.mouseState = {
			dX: 0,
			dY: 0
		};

		if (this.domElement) {
			this.setupMouseControls();
		}
		
		// $dan: HACK for hunter
		this.allowLock = function() { return true; };
	}

	var mousedown = function () {
		if (this.allowLock())
			GameUtils.requestPointerLock();
	};

	var mousemove = function (event) {
		if (this.pointerLocked) {
			this.mouseState.dX += event.movementX;
			this.mouseState.dY += event.movementY;
		}
	};

	var pointerLockChange = function (/*event*/) {
		this.pointerLocked = !!document.pointerLockElement;
	};

	var pointerLockError = function (/*event*/) {
		this.pointerLocked = !!document.pointerLockElement;
	};

	FPCamControlScript.prototype.setupMouseControls = function () {
	
		this.domElement.addEventListener('mousedown', mousedown.bind(this), false);
		
		document.addEventListener('mousemove', mousemove.bind(this));
		document.addEventListener('pointerlockchange', pointerLockChange.bind(this));
		document.addEventListener('pointerlockerror', pointerLockError.bind(this));

		// attempt to request a pointer lock; will succeed only if fullscreen is enabled
		GameUtils.requestPointerLock();
	};

	FPCamControlScript.prototype.run = function (entity, tpf, env) {
		if (env) {
			if (!this.domElement && env.domElement) {
				this.domElement = env.domElement;
				this.setupMouseControls();
			}
		}

		var transformComponent = entity.transformComponent;
		var transform = transformComponent.transform;

		var orient = transform.rotation;
		orient.toAngles(this.calcVector);
		this.rotY = this.calcVector.x;
		this.rotX = this.calcVector.y;

		// apply dx around upVector
		if (this.mouseState.dX !== 0) {
			this.rotX -= this.turnSpeedHorizontal * this.mouseState.dX;
		}
		// apply dy around left vector
		if (this.mouseState.dY !== 0) {
			this.rotY -= this.turnSpeedVertical * this.mouseState.dY;
			if (this.rotY > this.maxAscent) {
				this.rotY = this.maxAscent;
			} else if (this.rotY < this.minAscent) {
				this.rotY = this.minAscent;
			}
		}
		//Matrix3x3.combine(this.calcMat1, thisCalcMat2, transform.rotation);
		transform.rotation.fromAngles(this.rotY, this.rotX, 0.0);

		// set our component updated.
		transformComponent.setUpdated();

		// clear state
		this.mouseState.dX = 0;
		this.mouseState.dY = 0;
	};

	return FPCamControlScript;
});