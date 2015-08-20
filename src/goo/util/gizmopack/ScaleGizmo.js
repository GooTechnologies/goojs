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

		this._scale = 1;
		this._transformScale = new Vector3();
		this._transformScale.setDirect(1, 1, 1);

		this.compileRenderables();
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
		this._transformScale.setVector(transform.scale);
	};

	ScaleGizmo.prototype.process = function (mouseState, oldMouseState) {
		if (this._activeHandle.axis === 3) {
			this._scaleUniform(mouseState, oldMouseState);
		} else {
			this._scaleNonUniform(mouseState, oldMouseState);
		}

		this._postProcess(this._transformScale);
	};

	ScaleGizmo.prototype._scaleUniform = function (mouseState, oldMouseState) {
		var scale = Math.pow(
			1 + mouseState.x + oldMouseState.y - oldMouseState.x - mouseState.y,
			this._scale
		);

		var cameraEntityDistance = Renderer.mainCamera.translation.distance(this.transform.translation);
		scale += cameraEntityDistance / 200000 * MathUtils.sign(scale - 1);

		this._transformScale.scale(scale);
	};

	ScaleGizmo.prototype._scaleNonUniform = function (mouseState, oldMouseState) {
		Renderer.mainCamera.getPickRay(oldMouseState.x, oldMouseState.y, 1, 1, this._oldRay);
		Renderer.mainCamera.getPickRay(mouseState.x, mouseState.y, 1, 1, this._newRay);

		var oldWorldPos = this._v0,
			worldPos = this._v1,
			line = this._line,
			result = this._result;

		// Project mousemove to plane
		this._plane.rayIntersect(this._oldRay, oldWorldPos);
		this._plane.rayIntersect(this._newRay, worldPos);
		result.setVector(worldPos).subVector(oldWorldPos);
		result.div(this.transform.scale).scale(0.07);
		// Then project plane diff to line
		var d = result.dot(line);
		result.setVector(line).scale(d);
		var scale = Math.pow(1 + d, this._scale);

		this._transformScale.data[this._activeHandle.axis] *= scale;
	};

	ScaleGizmo.prototype.compileRenderables = function () {
		var boxMesh = new Box(1.4, 1.4, 1.4);
		var arrowMesh = buildArrowMesh();

		this.addRenderable(buildBox(boxMesh));
		this.addRenderable(buildArrow(arrowMesh, 0));
		this.addRenderable(buildArrow(arrowMesh, 1));
		this.addRenderable(buildArrow(arrowMesh, 2));
	};

	function buildBox(boxMesh) {
		return {
			meshData: boxMesh,
			materials: [Gizmo.buildMaterialForAxis(3)],
			transform: new Transform(),
			id: Gizmo.registerHandle({ type: 'Scale', axis: 3 })
		};
	}

	function buildArrow(arrowMesh, dim) {
		var transform = new Transform();

		if (dim === 0) {
			transform.setRotationXYZ(0, Math.PI / 2, 0);
		} else if (dim === 1) {
			transform.setRotationXYZ(Math.PI * 3 / 2, 0, 0);
		}

		return {
			meshData: arrowMesh,
			materials: [Gizmo.buildMaterialForAxis(dim)],
			transform: transform,
			id: Gizmo.registerHandle({ type: 'Scale', axis: dim })
		};
	}

	function buildArrowMesh() {
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
	}

	return ScaleGizmo;
});