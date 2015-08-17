define([
	'goo/util/gizmopack/Gizmo',
	'goo/renderer/MeshData',
	'goo/util/MeshBuilder',
	'goo/shapes/Disk',
	'goo/shapes/Quad',
	'goo/math/Transform',
	'goo/math/Vector3',
	'goo/math/Matrix4x4',
	'goo/renderer/Renderer'
], function (
	Gizmo,
	MeshData,
	MeshBuilder,
	Disk,
	Quad,
	Transform,
	Vector3,
	Matrix4x4,
	Renderer
) {
	'use strict';

	/**
	 * @extends Gizmo
	 * @hidden
	 */
	function TranslationGizmo() {
		Gizmo.call(this, 'TranslationGizmo');

		// Build geometry
		this._quadMesh = new Quad(2, 2);
		this._arrowMesh = this._buildArrowMesh();
		this._buildArrow(0);
		this._buildArrow(1);
		this._buildArrow(2);

		this.realTranslation = new Vector3();
		this._snap = false;
	}

	TranslationGizmo.prototype = Object.create(Gizmo.prototype);
	TranslationGizmo.prototype.constructor = TranslationGizmo;

	// Triggered when you have mousedown on a gizmo handle
	TranslationGizmo.prototype.activate = function (props) {
		Gizmo.prototype.activate.call(this, props);
		this._setPlane();
		if (this._activeHandle.type === 'Axis') {
			this._setLine();
		}
	};

	TranslationGizmo.prototype._changed = function () {
		if (this.onChange instanceof Function) {
			this.onChange(this.transform.translation);
		}
	};

	/**
	 * Turns snapping on or off
	 * @param {boolean} snap
	 */
	TranslationGizmo.prototype.setSnap = function (snap) {
		var oldSnap = this._snap;
		this._snap = snap;

		// unsnap when coming out of snapping mode
		if (oldSnap && !this._snap) {
			this.transform.translation.copy(this.realTranslation);
			this._changed();
		} else if (!oldSnap && this._snap) {
			snapToGrid(this.transform.translation);
			this.transform.update();
			this._changed();
		}
	};

	// Changing transform once per process
	TranslationGizmo.prototype.process = function () {
		//! AT: why are these Arrays and not vec2?
		var op = this._mouse.oldPosition;
		var p = this._mouse.position;

		Renderer.mainCamera.getPickRay(op[0], op[1], 1, 1, this._oldRay);
		Renderer.mainCamera.getPickRay(p[0], p[1], 1, 1, this._newRay);

		if (this._activeHandle.type === 'Plane') {
			this._moveOnPlane();
		} else if (this._activeHandle.type === 'Axis') {
			this._moveOnLine();
		}

		op[0] = p[0];
		op[1] = p[1];

		this.updateTransforms();
		this.dirty = false;

		this._changed();
	};

	TranslationGizmo.prototype.copyTransform = function (transform, global) {
		Gizmo.prototype.copyTransform.call(this, transform);

		this.realTranslation.copy(this.transform.translation);

		//! AT: can transform ever not be supplied but global be supplied?!?
		if (transform && global) {
			this.transform.rotation.setIdentity();
			this.updateTransforms();
		}
	};

	function snapToGrid(vector3) {
		vector3.data[0] = Math.round(vector3.data[0]);
		vector3.data[1] = Math.round(vector3.data[1]);
		vector3.data[2] = Math.round(vector3.data[2]);
	}

	TranslationGizmo.prototype._addTranslation = function (that) {
		this.realTranslation.add(that);
		this.transform.translation.copy(this.realTranslation);

		if (this._snap) {
			snapToGrid(this.transform.translation);
		}
	};

	// Moving along a plane
	TranslationGizmo.prototype._moveOnPlane = function () {
		var oldWorldPos = this._v0,
			worldPos = this._v1,
			moveVector = this._result;

		// Project mouse move to plane
		this._plane.rayIntersect(this._oldRay, oldWorldPos, true);
		this._plane.rayIntersect(this._newRay, worldPos, true);
		moveVector.setVector(worldPos).subVector(oldWorldPos);

		this._addTranslation(moveVector);
	};

	TranslationGizmo.prototype._moveOnLine = function () {
		var oldWorldPos = this._v0,
			worldPos = this._v1,
			moveVector = this._result,
			line = this._line;

		// Project mousemove to plane
		this._plane.rayIntersect(this._oldRay, oldWorldPos, true);
		this._plane.rayIntersect(this._newRay, worldPos, true);
		moveVector.setVector(worldPos).subVector(oldWorldPos);

		// Then project plane diff to line
		var d = moveVector.dot(line);
		moveVector.setVector(line).scale(d);

		this._addTranslation(moveVector);
	};

	TranslationGizmo.prototype._buildArrow = function (dim) {
		var arrowTransform = new Transform();
		var quadTransform = new Transform();

		var size = 1.0;
		quadTransform.scale.setDirect(size, size, size);
		if (dim === 2) {
			quadTransform.translation.setDirect(size, size, 0);
		} else if (dim === 0) {
			quadTransform.translation.setDirect(0, size, size);
			quadTransform.setRotationXYZ(0, Math.PI / 2, 0);
			arrowTransform.setRotationXYZ(0, Math.PI / 2, 0);
		} else if (dim === 1) {
			quadTransform.translation.setDirect(size, 0, size);
			quadTransform.setRotationXYZ(Math.PI / 2, 0, 0);
			arrowTransform.setRotationXYZ(Math.PI * 3 / 2, 0, 0);
		}

		this.addRenderable({
			meshData: this._arrowMesh,
			materials: [this._buildMaterialForAxis(dim)],
			transform: arrowTransform,
			id: Gizmo.registerHandle({ type: 'Axis', axis: dim }),
			thickness: 0.6
		});

		this.addRenderable({
			meshData: this._quadMesh,
			materials: [this._buildMaterialForAxis(dim, 0.6)],
			transform: quadTransform,
			id: Gizmo.registerHandle({ type: 'Plane', axis: dim })
		});
	};

	TranslationGizmo.prototype._buildArrowMesh = function () {
		var meshBuilder = new MeshBuilder();

		// Arrow head
		var mesh1Data = new Disk(32, 0.6, 2.3);
		// Arrow base
		var mesh2Data = new Disk(32, 0.6);
		// Line
		var mesh3Data = new MeshData(MeshData.defaultMap([MeshData.POSITION]), 2, 2);
		mesh3Data.getAttributeBuffer(MeshData.POSITION).set([0, 0, 0, 0, 0, 7]);
		mesh3Data.getIndexBuffer().set([0, 1]);
		mesh3Data.indexLengths = null;
		mesh3Data.indexModes = ['Lines'];

		// Arrow head
		var transform = new Transform();
		transform.translation.setDirect(0, 0, 7);
		transform.update();
		meshBuilder.addMeshData(mesh1Data, transform);

		// Arrow base
		transform.setRotationXYZ(0, Math.PI, 0);
		transform.update();
		meshBuilder.addMeshData(mesh2Data, transform);

		// Line
		var transform = new Transform();
		transform.update();
		meshBuilder.addMeshData(mesh3Data, transform);

		// Combine
		var mergedMeshData = meshBuilder.build()[0];
		return mergedMeshData;
	};

	return TranslationGizmo;
});