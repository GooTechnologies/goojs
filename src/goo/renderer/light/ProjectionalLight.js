define([
	'goo/math/Vector3',
	'goo/math/Matrix3x3',
	'goo/math/Quaternion',
	'goo/math/MathUtils',
	'goo/renderer/light/Light'
], function (
	Vector3,
	Matrix3x3,
	Quaternion,
	MathUtils,
	Light
) {
	'use strict';

	/**
	 * Superclass for lights implementing light cookies.
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/renderer/light/LightCookie-vtest.html Working example
	 * @extends Light
	 * @param {Vector3} [color=(1, 1, 1)] The color of the light
	 */
	function ProjectionalLight(color) {
		
		Light.call(this, color);

		/**
		 * The direction vector of the light
		 * @readonly
		 * @type {Vector3}
		 */
		this.direction = new Vector3();

		/**
		 * By default lights shine a single color on surfaces. If however this parameter is used then the light will project a texture (called 'light cookie') on surfaces. The light cookie will be multiplied with the color of the light
		 * @type {Texture}
		 */
		this.lightCookie = null;

		/**
		* The rotation angle in radians,
		* along the light's direction.
		* Used for rotating the lightCookie.
		* This property is updated automatically
		* from the parenting entity.
		* @readonly
		* @type {number}
		*/
		this.directionRotation = 0.0;

		// Private working variables for lightCookie rotation calculations
		this.xvec = new Vector3();
		this.zvec = new Vector3();
		this.xBase = new Vector3();
		this.rotMat = new Matrix3x3();
		this.rotQuat = new Quaternion();
	}

	ProjectionalLight.prototype = Object.create(Light.prototype);

	/**
	 * Updates the light's translation and orientation
	 * @hidden
	 * @param {Transform} transform
	 */
	ProjectionalLight.prototype.update = function (transform) {
		transform.matrix.getTranslation(this.translation);

		this.direction.setDirect(0.0, 0.0, -1.0);
		transform.matrix.applyPostVector(this.direction);

		if (this.lightCookie) {
			this.updateDirectionRotation(transform);
		}
	};

	ProjectionalLight.prototype.updateDirectionRotation = function (transform) {
		var matrixData = transform.rotation.data;
		this.xvec.setDirect(matrixData[0], matrixData[1], matrixData[2]);
		this.zvec.setDirect(matrixData[6], matrixData[7], matrixData[8]);

		this.rotQuat.fromVectorToVector(Vector3.UNIT_Z, this.zvec);
		this.rotQuat.toRotationMatrix(this.rotMat);
		this.xBase.setDirect(1, 0, 0);
		this.rotMat.applyPost(this.xBase);
		var xdot = Vector3.dot(this.xvec, this.xBase);
		// The dot product goes above 1.0 at zero rotation
		xdot = Math.min(xdot, 1.0);
		// Magic solution, probably not. Math anyone?
		if (this.xvec.y + this.xBase.y < 0) {
			this.directionRotation = Math.PI + Math.acos(-xdot);
		} else {
			this.directionRotation = Math.acos(xdot);
		}
	};

	ProjectionalLight.prototype.copy = function (source) {
		Light.prototype.copy.call(this, source);
		this.direction.copy(source.direction);
		return this;
	};

	return ProjectionalLight;
});