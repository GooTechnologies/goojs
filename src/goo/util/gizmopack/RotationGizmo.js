define([
	'goo/util/gizmopack/Gizmo',
	'goo/shapes/Sphere',
	'goo/shapes/Torus',
	'goo/math/Vector3',
	'goo/math/Matrix3',
	'goo/math/Transform',
	'goo/renderer/Renderer',
	'goo/math/Ray'
], function (
	Gizmo,
	Sphere,
	Torus,
	Vector3,
	Matrix3,
	Transform,
	Renderer,
	Ray
) {
	'use strict';

	/**
	 * @extends Gizmo
	 * @hidden
	 */
	function RotationGizmo() {
		Gizmo.call(this, 'RotationGizmo');
		this._ballMesh = new Sphere(32, 32, 1.1);
		this._torusMesh = new Torus(64, 8, 0.1, 2.5);

		this._buildBall();
		this._buildTorus(0);
		this._buildTorus(1);
		this._buildTorus(2);

		this._rotation = new Matrix3();
		this._rotationScale = 4;
		this._axis = new Vector3();
		this._direction = new Vector3();

		this._ray = new Ray();
		this._m1 = new Matrix3();
		this._m2 = new Matrix3();

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

	RotationGizmo.prototype = Object.create(Gizmo.prototype);
	RotationGizmo.prototype.constructor = RotationGizmo;

	var tmpVec = new Vector3();

	RotationGizmo.prototype.activate = function(props) {
		Gizmo.prototype.activate.call(this, props);

		var worldCenter = this._v0,
			pickedPoint = this._v1,
			rotationDirection = this._v2,
			axis = this._axis,
			ray = this._ray;

		if(this._activeHandle.axis < 3) {
			// Get rotation axis
			axis.set([Vector3.UNIT_X, Vector3.UNIT_Y, Vector3.UNIT_Z][this._activeHandle.axis]);
			this.transform.rotation.applyPost(axis);

			// Get rotation center
			worldCenter.set(Vector3.ZERO);
			this.transform.matrix.applyPostPoint(worldCenter);

			// Get picked point in world space (sort of)
			Renderer.mainCamera.getPickRay(
				props.x,
				props.y,
				1,1,
				ray
			);
			pickedPoint.set(ray.origin).sub(worldCenter);
			var d = pickedPoint.length() * 0.9;
			pickedPoint.set(ray.direction).scale(d).add(ray.origin);

			// Get vector from center to picked point, cross it with rotation axis and get drag direction
			rotationDirection.set(pickedPoint).sub(worldCenter);
			tmpVec.set(rotationDirection);
			rotationDirection.set(axis).cross(tmpVec);
			rotationDirection.add(pickedPoint);
			Renderer.mainCamera.getScreenCoordinates(
				rotationDirection,
				1, 1,
				this._direction
			);
			this._direction.subDirect(props.x, props.y, 0);

			this._direction.z = 0;
			this._direction.normalize();
		}
	};

	RotationGizmo.prototype.process = function() {
		var op = this._mouse.oldPosition;
		var p = this._mouse.position;
		var dx = p[0] - op[0];
		var dy = p[1] - op[1];
		if(this._activeHandle.axis === 3) {
			this._rotateOnScreen(dx, dy);
		} else {
			this._rotateOnAxis(dx, dy);
		}

		op[0] = p[0];
		op[1] = p[1];
		this.updateTransforms();
		this.dirty = false;

		if(this.onChange instanceof Function) {
			this.onChange(this.transform.rotation);
		}
	};

	RotationGizmo.prototype._rotateOnScreen = function(dx, dy) {
		this._rotation.setIdentity();

		if (this.snap && false) { // snap in this mode is confusing
			this.accumulatedRotationY += dx * this._rotationScale;
			this.accumulatedRotationX += dy * this._rotationScale;

			var angleLimit = Math.PI / 8;

			if (this.accumulatedRotationX > angleLimit) {
				this.accumulatedRotationX -= angleLimit;
				this._rotation.rotateX(angleLimit);
			} else if (this.accumulatedRotationX < 0) {
				this.accumulatedRotationX += angleLimit;
				this._rotation.rotateX(-angleLimit);
			}

			if (this.accumulatedRotationY > angleLimit) {
				this.accumulatedRotationY -= angleLimit;
				this._rotation.rotateY(angleLimit);
			} else if (this.accumulatedRotationY < 0) {
				this.accumulatedRotationY += angleLimit;
				this._rotation.rotateY(-angleLimit);
			}
		} else {
			this._rotation.rotateY(dx * this._rotationScale);
			this._rotation.rotateX(dy * this._rotationScale);
		}

		var camMat = Renderer.mainCamera.getViewMatrix();
		var camRotation = this._m1, screenRotation = this._m2;

		camRotation.set(camMat);
		screenRotation.set(camRotation).invert();
		screenRotation.mul2(this._rotation, screenRotation);
		screenRotation.mul2(screenRotation, camRotation);

		this.transform.rotation.mulPre(screenRotation);
	};

	// --- functions for snapping to certain angles go here
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

	var inclined8thpi = inclinedType2(Math.PI / 4, Math.PI / 16);
	var tranFun = inclined8thpi;
	// ---

	RotationGizmo.prototype._rotateOnAxis = function(dx, dy) {
		this._rotation.setIdentity();

		var sum = (dx * this._direction.x) + (dy * this._direction.y);
		sum *= this._rotationScale;

		if (this.snap) {
			switch(this._activeHandle.axis) {
				case 0:
					this.accumulatedRotationThorX += sum;
					var newAngleX = tranFun(this.accumulatedRotationThorX);
					this._rotation.rotateX(newAngleX - this.oldAngleX);
					this.oldAngleX = newAngleX;
					break;
				case 1:
					this.accumulatedRotationThorY += sum;
					var newAngleY = tranFun(this.accumulatedRotationThorY);
					this._rotation.rotateY(newAngleY - this.oldAngleY);
					this.oldAngleY = newAngleY;
					break;
				case 2:
					this.accumulatedRotationThorZ += sum;
					var newAngleZ = tranFun(this.accumulatedRotationThorZ);
					this._rotation.rotateZ(newAngleZ - this.oldAngleZ);
					this.oldAngleZ = newAngleZ;
					break;
			}
		} else {
			switch(this._activeHandle.axis) {
				case 0:
					this.accumulatedRotationThorX += sum;
					var newAngleX = this.accumulatedRotationThorX;
					this._rotation.rotateX(newAngleX - this.oldAngleX);
					this.oldAngleX = newAngleX;
					break;
				case 1:
					this.accumulatedRotationThorY += sum;
					var newAngleY = this.accumulatedRotationThorY;
					this._rotation.rotateY(newAngleY - this.oldAngleY);
					this.oldAngleY = newAngleY;
					break;
				case 2:
					this.accumulatedRotationThorZ += sum;
					var newAngleZ = this.accumulatedRotationThorZ;
					this._rotation.rotateZ(newAngleZ - this.oldAngleZ);
					this.oldAngleZ = newAngleZ;
					break;
			}
		}

		this.transform.rotation.mul2(this.transform.rotation, this._rotation);
	};

	RotationGizmo.prototype._buildBall = function() {
		var transform = new Transform();
		transform.scale.setDirect(1.2, 1.2, 1.2);
		this.addRenderable({
			meshData: this._ballMesh,
			materials: [this._buildMaterialForAxis(3, 0.6)],
			transform: new Transform(),
			id: Gizmo.registerHandle({ type: 'Rotate', axis: 3 })
		});
	};

	RotationGizmo.prototype._buildTorus = function(dim) {
		var transform = new Transform();
		transform.scale.setDirect(1.7, 1.7, 1.7);
		if(dim === 0) {
			transform.setRotationXYZ(0, Math.PI/2, 0);
		} else if (dim === 1) {
			transform.setRotationXYZ(Math.PI/2, 0, 0);
		}

		this.addRenderable({
			meshData: this._torusMesh,
			materials: [this._buildMaterialForAxis(dim)],
			transform: transform,
			id: Gizmo.registerHandle({ type: 'Rotate', axis: dim }),
			thickness: 0.35
		});
	};

	return RotationGizmo;
});