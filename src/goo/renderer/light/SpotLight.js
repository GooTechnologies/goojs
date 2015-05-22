define([
	'goo/math/Vector3',
	'goo/renderer/light/Light',
	'goo/math/MathUtils'
], function (
	Vector3,
	Light,
	MathUtils
) {
	'use strict';

	/**
	 * The SpotLight can be viewed as two cones with their apexes located at the light's location.
	 * The properties angle sets the angle (in degrees) for which the outer cone
	 * deviates from the light's direction. The exponent property sets the angle for the inner cone.
	 * The angle property is also known as the outer angle or falloff. The exponent property is also known as
	 * the inner angle or hotspot.
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/renderer/light/Lights-vtest.html Working example
	 * @extends Light
	 * @param {Vector3} [color=(1, 1, 1)] The color of the light
	 */
	function SpotLight(color) {
		Light.call(this, color);

		/**
		 * The direction vector of the light
		 * @readonly
		 * @type {Vector3}
		 */
		this.direction = new Vector3();

		/**
		 * The range of the light (default is 1000)
		 * @type {number}
		 */
		this.range = 1000;

		/**
		 * The angle (in degrees) of the cone of light that this spotlight projects (default is 45)
		 * @type {number}
		 */
		this.angle = 45;

		/**
		 * The angle to where light is full strength. Then it falls off linearly to the angle-value; penumbra is always smaller than angle. Set to null if the penumbra should be the same as the angle.
		 * @type {number}
		 */
		this.penumbra = null;

		/** @type {number} */
		this.exponent = 16.0;

		// #ifdef DEBUG
		Object.seal(this);
		// #endif
	}

	SpotLight.prototype = Object.create(Light.prototype);
	SpotLight.prototype.constructor = SpotLight;

	/**
	 * Updates the light's translation and orientation
	 * @hidden
	 * @param {Transform} transform
	 */

	var xvec = new Vector3();
	var yvec = new Vector3();
	SpotLight.prototype.update = function (transform) {
		transform.matrix.getTranslation(this.translation);

		this.direction.setDirect(0.0, 0.0, -1.0);
		transform.matrix.applyPostVector(this.direction);

		if (this.lightCookie) {
			var eulerAngles = transform.rotation.toAngles().data;
			console.log('Eulerangles', transform.rotation.toAngles().data);
			var d = transform.rotation.data;
			xvec.setDirect(d[0], d[1], d[2]);
			yvec.setDirect(d[3], d[4], d[5]);
			
			var xdot = Vector3.dot(xvec, Vector3.UNIT_X);
			
			console.log('xvec', xvec.data);
			console.log('yvec', yvec.data);
			console.log('xdot', xdot);
			
			this.directionRotation = Math.acos(xdot);
			if (xvec.y < 0) {
				this.directionRotation = Math.PI - this.directionRotation;
			} 

			if (transform.rotation.negY && this.directionRotation != 0) {
				this.directionRotation = Math.PI + this.directionRotation;
			}



			console.debug('Angle', this.directionRotation);
		}
		
	};

	SpotLight.prototype.copy = function (source) {
		Light.prototype.copy.call(this, source);

		source.direction.copy(this.direction);
		this.range = source.range;
		this.angle = source.angle;
		this.penumbra = source.penumbra;
		this.exponent = source.exponent;

		return this;
	};

	SpotLight.prototype.clone = function () {
		var clone = new SpotLight(this.color.clone());
		clone.copy(this);
		return clone;
	};

	return SpotLight;
});