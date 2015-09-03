define([
	'goo/util/gizmopack/Gizmo',
	'goo/shapes/Sphere',
	'goo/shapes/Torus',
	'goo/math/Vector3',
	'goo/math/Matrix3x3',
	'goo/math/Transform',
	'goo/renderer/Renderer',
	'goo/math/Ray',
	'goo/math/MathUtils'
], function (
	Gizmo,
	Sphere,
	Torus,
	Vector3,
	Matrix3x3,
	Transform,
	Renderer,
	Ray,
	MathUtils
) {
	'use strict';

	/**
	 * @extends Gizmo
	 * @hidden
	 */
	function RotationGizmo() {
		Gizmo.call(this, 'RotationGizmo');

		this._rotation = new Matrix3x3();
		this._direction = new Vector3();

		//TODO: create a function that does this sort of thing
		this.snap = false;
		this._accumulatedRotation = new Vector3();
		this._oldAngle = new Vector3();

		this.compileRenderables();
	}

	RotationGizmo.prototype = Object.create(Gizmo.prototype);
	RotationGizmo.prototype.constructor = RotationGizmo;

	var ROTATION_SCALE = 4;

	(function () {
		var worldCenter = new Vector3();
		var pickedPoint = new Vector3();
		var rotationDirection = new Vector3();
		var axis = new Vector3();
		var ray = new Ray();

		RotationGizmo.prototype.activate = function (props) {
			Gizmo.prototype.activate.call(this, props);

			if (this._activeHandle.axis < 3) {
				// Get rotation axis
				axis.copy([Vector3.UNIT_X, Vector3.UNIT_Y, Vector3.UNIT_Z][this._activeHandle.axis]);
				this.transform.rotation.applyPost(axis);

				// Get rotation center
				worldCenter.copy(Vector3.ZERO);
				this.transform.matrix.applyPostPoint(worldCenter);

				// Get picked point in world space (sort of)
				Renderer.mainCamera.getPickRay(
					props.x,
					props.y,
					1,
					1,
					ray
				);
				pickedPoint.copy(ray.origin).subVector(worldCenter);
				var d = pickedPoint.length() * 0.9;
				pickedPoint.copy(ray.direction).scale(d).addVector(ray.origin);

				// Get vector from center to picked point, cross it with rotation axis and get drag direction
				rotationDirection.copy(pickedPoint).subVector(worldCenter);
				Vector3.cross(axis, rotationDirection, rotationDirection);
				rotationDirection.addVector(pickedPoint);
				Renderer.mainCamera.getScreenCoordinates(
					rotationDirection,
					1,
					1,
					this._direction
				);
				this._direction.subDirect(props.x, props.y, 0);

				this._direction.z = 0;
				this._direction.normalize();
			}
		};
	})();

	RotationGizmo.prototype.process = function (mouseState, oldMouseState) {
		var delta = mouseState.clone().subVector(oldMouseState);

		if (this._activeHandle.axis === 3) {
			this._rotateOnScreen(delta);
		} else {
			this._rotateOnAxis(delta);
		}

		this._postProcess(this.transform.rotation);
	};

	(function () {
		var camRotation = new Matrix3x3();
		var screenRotation = new Matrix3x3();

		RotationGizmo.prototype._rotateOnScreen = function (delta) {
			this._rotation.setIdentity();

			this._rotation.rotateY(delta.x * ROTATION_SCALE);
			this._rotation.rotateX(delta.y * ROTATION_SCALE);

			var camMat = Renderer.mainCamera.getViewMatrix().data;

			// there has to be a function for this
			camRotation.set(
				camMat[0], camMat[1], camMat[2],
				camMat[4], camMat[5], camMat[6],
				camMat[8], camMat[9], camMat[10]
			);
			screenRotation.set(camRotation).invert();
			screenRotation.combine(this._rotation);
			screenRotation.combine(camRotation);

			Matrix3x3.combine(
				screenRotation,
				this.transform.rotation,
				this.transform.rotation
			);
		};
	})();

	// --- functions for snapping to certain angles
	function inclinedType2 (size, t) {
		return function (x) {
			var z = x % size;
			z += z < 0 ? size : 0;
			if (z < t) {
				return x - z;
			} else if (z > size - t) {
				return x + size - z;
			}
			return x;
		};
	}

	var snapFunction = inclinedType2(Math.PI / 4, Math.PI / 16);
	var identityFunction = function (x) { return x; };
	// ---

	RotationGizmo.prototype._applyRotation = function () {
		Matrix3x3.combine(
			this.transform.rotation,
			this._rotation,
			this.transform.rotation
		);
	};

	RotationGizmo.prototype._rotateOnAxis = function (delta) {
		this._rotation.setIdentity();

		var sum = (delta.x * this._direction.x) + (delta.y * this._direction.y);
		sum *= ROTATION_SCALE;

		var transformFunction = this._snap ? snapFunction : identityFunction;
		var newAngle;

		switch (this._activeHandle.axis) {
			case 0:
				this._accumulatedRotation.x += sum;
				newAngle = transformFunction(this._accumulatedRotation.x);
				this._rotation.rotateX(newAngle - this._oldAngle.x);
				this._oldAngle.x = newAngle;
				break;
			case 1:
				this._accumulatedRotation.y += sum;
				newAngle = transformFunction(this._accumulatedRotation.y);
				this._rotation.rotateY(newAngle - this._oldAngle.y);
				this._oldAngle.y = newAngle;
				break;
			case 2:
				this._accumulatedRotation.z += sum;
				newAngle = transformFunction(this._accumulatedRotation.z);
				this._rotation.rotateZ(newAngle - this._oldAngle.z);
				this._oldAngle.z = newAngle;
				break;
		}

		this._applyRotation();
	};

	RotationGizmo.prototype.compileRenderables = function () {
		var ballMesh = new Sphere(32, 32, 1.1);
		var torusMesh = new Torus(64, 8, 0.1, 2.5);

		this.addRenderable(buildBall(ballMesh));
		this.addRenderable(buildTorus(torusMesh, 0));
		this.addRenderable(buildTorus(torusMesh, 1));
		this.addRenderable(buildTorus(torusMesh, 2));
	};

	function buildBall(ballMesh) {
		var transform = new Transform();
		transform.scale.setDirect(1.2, 1.2, 1.2);

		return {
			meshData: ballMesh,
			materials: [Gizmo.buildMaterialForAxis(3, 0.6)],
			transform: new Transform(),
			id: Gizmo.registerHandle({ type: 'Rotate', axis: 3 })
		};
	}

	function buildTorus(torusMesh, dim) {
		var transform = new Transform();
		transform.scale.setDirect(1.7, 1.7, 1.7);
		if (dim === 0) {
			transform.setRotationXYZ(0, MathUtils.HALF_PI, 0);
		} else if (dim === 1) {
			transform.setRotationXYZ(MathUtils.HALF_PI, 0, 0);
		}

		return {
			meshData: torusMesh,
			materials: [Gizmo.buildMaterialForAxis(dim)],
			transform: transform,
			id: Gizmo.registerHandle({ type: 'Rotate', axis: dim }),
			thickness: 0.35
		};
	}

	return RotationGizmo;
});