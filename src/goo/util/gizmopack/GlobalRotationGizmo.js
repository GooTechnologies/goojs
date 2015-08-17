define([
	'goo/util/gizmopack/Gizmo',
	'goo/util/gizmopack/RotationGizmo',
	'goo/shapes/Sphere',
	'goo/shapes/Torus',
	'goo/math/Vector3',
	'goo/math/Matrix3x3',
	'goo/math/Matrix4x4',
	'goo/math/Transform',
	'goo/renderer/Renderer',
	'goo/math/Ray'
], function (
	Gizmo,
	RotationGizmo,
	Sphere,
	Torus,
	Vector3,
	Matrix3x3,
	Matrix4x4,
	Transform,
	Renderer,
	Ray
) {
	'use strict';

	/**
	 * @extends Gizmo
	 * @hidden
	 */
	function GlobalRotationGizmo() {
		Gizmo.call(this, 'GlobalRotationGizmo');

		this._ballMesh = new Sphere(32, 32, 1.1);
		this._torusMesh = new Torus(64, 8, 0.1, 2.5);

		this._buildBall();
		this._buildTorus(0);
		this._buildTorus(1);
		this._buildTorus(2);

		this._rotation = new Matrix3x3();
		this._rotationScale = 4;
		this._axis = new Vector3();
		this._direction = new Vector3();

		this._ray = new Ray();
		this._m1 = new Matrix3x3();
		this._m2 = new Matrix3x3();

		//TODO: create a function that does this sort of thing
		this.snap = false;
		this.accumulatedRotationX = 0;
		this.accumulatedRotationY = 0;
		this.accumulatedRotationThorX = 0;
		this.accumulatedRotationThorY = 0;
		this.accumulatedRotationThorZ = 0;
		this.oldAngleX = 0;
		this.oldAngleY = 0;
		this.oldAngleZ = 0;
	}

	GlobalRotationGizmo.prototype = Object.create(Gizmo.prototype);
	GlobalRotationGizmo.prototype.constructor = GlobalRotationGizmo;

	GlobalRotationGizmo.prototype.activate = function(props) {
		Gizmo.prototype.activate.call(this, props);

		var worldCenter = this._v0,
			pickedPoint = this._v1,
			rotationDirection = this._v2,
			axis = this._axis,
			ray = this._ray;

		if (this._activeHandle.axis < 3) {
			// Get rotation axis
			axis.setVector([Vector3.UNIT_X, Vector3.UNIT_Y, Vector3.UNIT_Z][this._activeHandle.axis]);

			// Get rotation center
			worldCenter.setVector(Vector3.ZERO);
			this.transform.matrix.applyPostPoint(worldCenter);

			// Get picked point in world space (sort of)
			Renderer.mainCamera.getPickRay(
				props.x,
				props.y,
				1,
				1,
				ray
			);
			pickedPoint.setVector(ray.origin).subVector(worldCenter);
			var d = pickedPoint.length() * 0.9;
			pickedPoint.setVector(ray.direction).scale(d).addVector(ray.origin);

			// Get vector from center to picked point, cross it with rotation axis and get drag direction
			rotationDirection.setVector(pickedPoint).subVector(worldCenter);
			Vector3.cross(axis, rotationDirection, rotationDirection);
			rotationDirection.addVector(pickedPoint);
			Renderer.mainCamera.getScreenCoordinates(
				rotationDirection,
				1,1,
				this._direction
			);
			this._direction.subDirect(props.x, props.y, 0);

			this._direction.z = 0;
			this._direction.normalize();
		}
	};

	GlobalRotationGizmo.prototype.process = RotationGizmo.prototype.process;

	GlobalRotationGizmo.prototype._rotateOnScreen = RotationGizmo.prototype._rotateOnScreen;

	GlobalRotationGizmo.prototype._applyRotation = function () {
		Matrix3x3.combine(
			this._rotation,
			this.transform.rotation,
			this.transform.rotation
		);
	};

	GlobalRotationGizmo.prototype._rotateOnAxis = RotationGizmo.prototype._rotateOnAxis;

	(function () {
		var transform = new Transform();

		/**
		 * Update the transform of the provided renderable.
		 * @param renderable
		 */
		GlobalRotationGizmo.prototype.updateRenderableTransform = function (renderable) {
			transform.copy(this.transform);
			transform.rotation.setIdentity();
			transform.update();

			Matrix4x4.combine(
				transform.matrix,
				renderable.transform.matrix,
				renderable.transform.matrix
			);
		};
	})();

	GlobalRotationGizmo.prototype._buildBall = RotationGizmo.prototype._buildBall;

	GlobalRotationGizmo.prototype._buildTorus = RotationGizmo.prototype._buildTorus;

	return GlobalRotationGizmo;
});