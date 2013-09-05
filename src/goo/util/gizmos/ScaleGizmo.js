define([
	'goo/util/gizmos/Gizmo',
	'goo/renderer/MeshData',
	'goo/util/MeshBuilder',
	'goo/shapes/Box',
	'goo/renderer/Material',
	'goo/math/Transform',
	'goo/renderer/Renderer',
	'goo/math/Vector3'
], function(
	Gizmo,
	MeshData,
	MeshBuilder,
	Box,
	Material,
	Transform,
	Renderer,
	Vector3
) {
	'use strict';
	function ScaleGizmo(world) {
		Gizmo.call(this, world, 'ScaleGizmo');
		this._boxMesh = new Box();
		this._arrowMesh = this._buildArrowMesh();
		this._scale = 1;
		this._transformScale = new Vector3();
		this._transformScale.setd(1,1,1);

		this._buildBox();
		this._buildArrow(0);
		this._buildArrow(1);
		this._buildArrow(2);
	}
	ScaleGizmo.prototype = Object.create(Gizmo.prototype);

	ScaleGizmo.prototype.activate = function(props) {
		Gizmo.prototype.activate.call(this, props);
		if(this._activeHandle.axis !== 3) {
			this._setPlane();
			this._setLine();
		}
	};

	ScaleGizmo.prototype.copyTransform = function(transform) {
		Gizmo.prototype.copyTransform.call(this, transform);
		this._transformScale.setv(transform.scale);
	};

	ScaleGizmo.prototype.process = function() {
		var op = this._mouse.oldPosition;
		var p = this._mouse.position;

		if(this._activeHandle.axis === 3) {
			this._scaleUniform();
		} else {
			this._scaleNonUniform();
		}
		op[0] = p[0];
		op[1] = p[1];
		this.updateTransforms();
		this.dirty = false;

		if(this.onChange instanceof Function) {
			this.onChange(this._transformScale);
		}
	};

	ScaleGizmo.prototype._scaleUniform = function() {
		var op = this._mouse.oldPosition;
		var p = this._mouse.position;
		var scale = Math.pow(1 + p[0] + op[1] - op[0] - p[1],this._scale);
		this._transformScale.muld(scale,scale,scale);
	};

	//REVIEW: I once managed to flatten a fish without any hope of inflating it back
	// POST-REVIEW: Don't quite know how to fix that. You can always reset scales numerically in the tool.
	ScaleGizmo.prototype._scaleNonUniform = function() {
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
		result.setv(worldPos).subv(oldWorldPos);
		result.div(this.transform.scale).scale(0.07);
		// Then project plane diff to line
		var d = result.dot(line);
		result.setv(line).muld(d,d,d);
		var scale = Math.pow(1 + d, this._scale);

		switch(this._activeHandle.axis) {
			case 0:
				this._transformScale.data[0] *= scale;
				break;
			case 1:
				this._transformScale.data[1] /= scale;
				break;
			case 2:
				this._transformScale.data[2] *= scale;
				break;
		}
	};

	ScaleGizmo.prototype._buildBox = function() {
		this.renderables.push({
			meshData: this._boxMesh,
			materials: [this._buildMaterialForAxis(3)],
			transform: new Transform(),
			id: Gizmo.registerHandle({ type: 'Scale', axis: 3 })
		});
	};

	ScaleGizmo.prototype._buildArrow = function(dim) {
		var transform = new Transform();
		if(dim === 0) {
			transform.setRotationXYZ(0, Math.PI/2, 0);
		} else if (dim === 1) {
			transform.setRotationXYZ(Math.PI/2, 0, 0);
		}

		this.renderables.push({
			meshData: this._arrowMesh,
			materials: [this._buildMaterialForAxis(dim)],
			transform: transform,
			id: Gizmo.registerHandle({ type: 'Scale', axis: dim })
		});
	};

	ScaleGizmo.prototype._buildArrowMesh = function() {
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
		transform.translation.setd(0, 0, 10);
		transform.update();
		meshBuilder.addMeshData(mesh1Data, transform);

		// Line
		var transform = new Transform();
		transform.scale.setd(1, 1, 10);
		transform.update();
		meshBuilder.addMeshData(mesh2Data, transform);

		// Combine
		var mergedMeshData = meshBuilder.build()[0];

		return mergedMeshData;
	};

	return ScaleGizmo;
});