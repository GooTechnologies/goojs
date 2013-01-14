define(
	/** @lends FlyControlScript */
	function () {
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

		this.direction = direction;

		this.domElement.addEventListener('mousemove', bind(this, this.mousemove), false);
		this.domElement.addEventListener('mousedown', bind(this, this.mousedown), false);
		this.domElement.addEventListener('mouseup', bind(this, this.mouseup), false);

		this.domElement.addEventListener('keydown', bind(this, this.keydown), false);
		this.domElement.addEventListener('keyup', bind(this, this.keyup), false);
	}

	FlyControlScript.prototype.run = function (entity) {
		var transformComponent = entity.transformComponent;
		var transform = transformComponent.transform;

		var delta = entity._world.tpf;

		var moveMult = delta * this.movementSpeed * this.movementSpeedMultiplier;
		var rotMult = delta * this.rollSpeed * this.movementSpeedMultiplier;

		// TODO

		transformComponent.setUpdated();
	};

	return FlyControlScript;
});