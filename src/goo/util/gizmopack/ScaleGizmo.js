define([
	'goo/util/gizmopack/Gizmo',
	'goo/renderer/MeshData',
	'goo/util/MeshBuilder',
	'goo/shapes/Box',
	'goo/math/Transform',
	'goo/renderer/Renderer',
	'goo/math/Vector3',
	'goo/math/MathUtils'
], function (
	Gizmo,
	MeshData,
	MeshBuilder,
	Box,
	Transform,
	Renderer,
	Vector3,
	MathUtils
) {
	'use strict';

	/**
	 * @extends Gizmo
	 * @hidden
	 */
	function ScaleGizmo(gizmoRenderSystem) {
		Gizmo.call(this, 'ScaleGizmo', gizmoRenderSystem);
		this._boxMesh = new Box(1.4, 1.4, 1.4);
		this._arrowMesh = this._buildArrowMesh();
		this._scale = 1;
		this._transformScale = new Vector3();
		this._transformScale.setDirect(1, 1, 1);

		this._buildBox();
		this._buildArrow(0);
		this._buildArrow(1);
		this._buildArrow(2);
	}

	ScaleGizmo.prototype = Object.create(Gizmo.prototype);
	ScaleGizmo.prototype.constructor = ScaleGizmo;

	ScaleGizmo.prototype.activate = function (props) {
		Gizmo.prototype.activate.call(this, props);
		if (this._activeHandle.axis !== 3) {
			this._setPlane();
			this._setLine();
		}
	};

	ScaleGizmo.prototype.copyTransform = function (transform) {
		Gizmo.prototype.copyTransform.call(this, transform);
		this._transformScale.set(transform.scale);
	};

	ScaleGizmo.prototype.process = function () {
		var op = this._mouse.oldPosition;
		var p = this._mouse.position;

		if (this._activeHandle.axis === 3) {
			this._scaleUniform();
		} else {
			this._scaleNonUniform();
		}
		op[0] = p[0];
		op[1] = p[1];
		this.updateTransforms();
		this.dirty = false;

		if (this.onChange instanceof Function) {
			this.onChange(this._transformScale);
		}
	};

	ScaleGizmo.prototype._scaleUniform = function () {
		var op = this._mouse.oldPosition;
		var p = this._mouse.position;
		var scale = Math.pow(1 + p[0] + op[1] - op[0] - p[1], this._scale);

		var boundEntityTranslation = this.gizmoRenderSystem.entity.transformComponent.worldTransform.translation;
		var mainCameraTranslation = Renderer.mainCamera.translation;
		var cameraEntityDistance = mainCameraTranslation.distance(boundEntityTranslation);
		scale += cameraEntityDistance / 200000 * MathUtils.sign(scale - 1);

		this._transformScale.scale(scale);
	};

	ScaleGizmo.prototype._scaleNonUniform = function () {
		var p = this._mouse.position;
		var op = this._mouse.oldPosition;

		Renderer.mainCamera.getPickRay(op[0], op[1], 1, 1, this._oldRay);
		Renderer.mainCamera.getPickRay(p[0], p[1], 1, 1, this._newRay);

		var oldWorldPos = this._v0,
			worldPos = this._v1,
			line = this._line,
			result = this._result;

		// Project mousemove to plane
		this._plane.rayIntersect(this._oldRay, oldWorldPos);
		this._plane.rayIntersect(this._newRay, worldPos);
		result.set(worldPos).sub(oldWorldPos);
		result.div(this.transform.scale).scale(0.07);
		// Then project plane diff to line
		var d = result.dot(line);
		result.set(line).scale(d);
		var scale = Math.pow(1 + d, this._scale);

		switch (this._activeHandle.axis) {
			case 0:
				this._transformScale.x *= scale;
				break;
			case 1:
				this._transformScale.y *= scale;
				break;
			case 2:
				this._transformScale.z *= scale;
				break;
		}
	};

	ScaleGizmo.prototype._buildBox = function () {
		this.addRenderable({
			meshData: this._boxMesh,
			materials: [this._buildMaterialForAxis(3)],
			transform: new Transform(),
			id: Gizmo.registerHandle({ type: 'Scale', axis: 3 })
		});
	};

	ScaleGizmo.prototype._buildArrow = function (dim) {
		var transform = new Transform();
		if (dim === 0) {
			transform.setRotationXYZ(0, Math.PI / 2, 0);
		} else if (dim === 1) {
			transform.setRotationXYZ(Math.PI * 3 / 2, 0, 0);
		}

		this.addRenderable({
			meshData: this._arrowMesh,
			materials: [this._buildMaterialForAxis(dim)],
			transform: transform,
			id: Gizmo.registerHandle({ type: 'Scale', axis: dim })
		});
	};

	ScaleGizmo.prototype._buildArrowMesh = function () {
		var meshBuilder = new MeshBuilder();

		// Box
		var mesh1Data = new Box();

		// Line
		var mesh2Data = new MeshData(MeshData.defaultMap([MeshData.POSITION]), 2, 2);
		mesh2Data.getAttributeBuffer(MeshData.POSITION).set([0, 0, 0, 0, 0, 1]);
		mesh2Data.getIndexBuffer().set([0, 1]);
		mesh2Data.indexLengths = null;
		mesh2Data.indexModes = ['Lines'];

		// Box
		var transform = new Transform();
		transform.translation.setDirect(0, 0, 8);
		transform.update();
		meshBuilder.addMeshData(mesh1Data, transform);

		// Line
		var transform = new Transform();
		transform.scale.setDirect(1, 1, 8);
		transform.update();
		meshBuilder.addMeshData(mesh2Data, transform);

		// Combine
		var mergedMeshData = meshBuilder.build()[0];

		return mergedMeshData;
	};

	return ScaleGizmo;
});