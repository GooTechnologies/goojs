define([
	'goo/util/gizmos/Gizmo',
	'goo/entities/components/MeshData',
	'goo/entities/components/MeshRenderer',
	'goo/entities/components/MeshData',
	'goo/util/MeshBuilder',
	'goo/shapes/Sphere',
	'goo/shapes/Torus',
	'goo/renderer/Material',
	'goo/entities/EntityUtils',
	'goo/math/Vector3',
	'goo/math/Matrix3x3',
	'goo/math/Transform',
	'goo/renderer/Renderer',
	'goo/math/Ray'
], function(
	Gizmo,
	MeshDataComponent,
	MeshRenderer,
	MeshData,
	MeshBuilder,
	Sphere,
	Torus,
	Material,
	EntityUtils,
	Vector3,
	Matrix3x3,
	Transform,
	Renderer,
	Ray
) {
	'use strict';
	function RotationGizmo() {
		Gizmo.call(this, 'RotationGizmo');
		this._ballMesh = new Sphere(32, 32, 1.3);
		this._torusMesh = new Torus(64, 8, 0.2);

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
	}
	RotationGizmo.prototype = Object.create(Gizmo.prototype);

	RotationGizmo.prototype.activate = function(props) {
		Gizmo.prototype.activate.call(this, props);

		var worldCenter = this._v0,
			pickedPoint = this._v1,
			rotationDirection = this._v2,
			axis = this._axis,
			ray = this._ray;

		if(this._activeHandle.axis < 3) {
			// Get rotation axis
			axis.setv([Vector3.UNIT_X, Vector3.UNIT_Y, Vector3.UNIT_Z][this._activeHandle.axis]);
			this.transform.rotation.applyPost(axis);

			// Get rotation center
			worldCenter.setv(Vector3.ZERO);
			this.transform.matrix.applyPostPoint(worldCenter);

			// Get picked point in world space (sort of)
			Renderer.mainCamera.getPickRay(
				props.x,
				props.y,
				1,1,
				ray
			);
			pickedPoint.setv(ray.origin).subv(worldCenter);
			var d = pickedPoint.length() * 0.9;
			pickedPoint.setv(ray.direction).muld(d,d,d).addv(ray.origin);

			// Get vector from center to picked point, cross it with rotation axis and get drag direction
			rotationDirection.setv(pickedPoint).subv(worldCenter);
			Vector3.cross(axis, rotationDirection, rotationDirection);
			rotationDirection.addv(pickedPoint);
			Renderer.mainCamera.getScreenCoordinates(
				rotationDirection,
				1,1,
				this._direction
			);
			this._direction.sub_d(props.x, 1-props.y, 0);
			this._direction.y *= -1;

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
		this._rotation.rotateY(dx * this._rotationScale);
		this._rotation.rotateX(dy * this._rotationScale);

		var camMat = Renderer.mainCamera.getViewMatrix().data;
		var camRotation = this._m1, screenRotation = this._m2;

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

	RotationGizmo.prototype._rotateOnAxis = function(dx, dy) {
		this._rotation.setIdentity();
		var sum = (dx * this._direction.x) + (dy * this._direction.y);
		sum *= this._rotationScale;

		switch(this._activeHandle.axis) {
			case 0:
				this._rotation.rotateX(sum);
				break;
			case 1:
				this._rotation.rotateY(sum);
				break;
			case 2:
				this._rotation.rotateZ(sum);
				break;
		}
		Matrix3x3.combine(
			this.transform.rotation,
			this._rotation,
			this.transform.rotation
		);
	};

	RotationGizmo.prototype._buildBall = function() {
		this.renderables.push({
			meshData: this._ballMesh,
			materials: [this._buildMaterialForAxis(3)],
			transform: new Transform(),
			id: Gizmo.registerHandle({ type: 'Rotate', axis: 3 })
		});
	};

	RotationGizmo.prototype._buildTorus = function(dim) {
		var transform = new Transform();
		if(dim === 0) {
			transform.setRotationXYZ(0, Math.PI/2, 0);
		} else if (dim === 1) {
			transform.setRotationXYZ(Math.PI/2, 0, 0);
		}

		this.renderables.push({
			meshData: this._torusMesh,
			materials: [this._buildMaterialForAxis(dim)],
			transform: transform,
			id: Gizmo.registerHandle({ type: 'Rotate', axis: dim })
		});
	};

	return RotationGizmo;
});