define([
	'goo/util/gizmos/Gizmo',
	'goo/entities/components/MeshData',
	'goo/entities/components/MeshRenderer',
	'goo/entities/components/MeshData',
	'goo/util/MeshBuilder',
	'goo/shapes/Disk',
	'goo/shapes/Quad',
	'goo/renderer/Material',
	'goo/math/Transform',
	'goo/entities/EntityUtils',
	'goo/math/Vector3',
	'goo/renderer/Renderer'
], function(
	Gizmo,
	MeshDataComponent,
	MeshRendererComponent,
	MeshData,
	MeshBuilder,
	Disk,
	Quad,
	Material,
	Transform,
	EntityUtils,
	Vector3,
	Renderer
) {
	'use strict';
	function TranslationGizmo() {
		Gizmo.call(this, 'TranslationGizmo');

		// Build geometry
		this._quadMesh = new Quad(2, 2);
		this._arrowMesh = this._buildArrowMesh();
		this._buildArrow(0);
		this._buildArrow(1);
		this._buildArrow(2);
	}
	TranslationGizmo.prototype = Object.create(Gizmo.prototype);

	// Triggered when you have mousedown on a gizmo handle
	TranslationGizmo.prototype.activate = function(props) {
		Gizmo.prototype.activate.call(this, props);
		this._setPlane();
		if(this._activeHandle.type === 'Axis') {
			this._setLine();
		}
	};

	// Changing transform once per process
	TranslationGizmo.prototype.process = function() {
		var op = this._mouse.oldPosition;
		var p = this._mouse.position;
		Renderer.mainCamera.getPickRay(op[0], op[1], 1, 1, this._oldRay);
		Renderer.mainCamera.getPickRay(p[0], p[1], 1, 1, this._newRay);

		if(this._activeHandle.type === 'Plane') {
			this._moveOnPlane();
		} else if (this._activeHandle.type === 'Axis') {
			this._moveOnLine();
		}
		op[0] = p[0];
		op[1] = p[1];
		this.updateTransforms();
		this.dirty = false;

		if(this.onChange instanceof Function) {
			this.onChange(this.transform.translation);
		}
	};

	TranslationGizmo.prototype.copyTransform = function(transform, global) {
		Gizmo.prototype.copyTransform.call(this, transform);
		if (transform && global) {
			this.transform.rotation.setIdentity();
			this.updateTransforms();
		}
	};

	// Moving along a plane
	TranslationGizmo.prototype._moveOnPlane = function() {
		var oldWorldPos = this._v0,
			worldPos = this._v1,
			moveVector = this._result;

		// Project mouse move to plane
		this._plane.rayIntersect(this._oldRay, oldWorldPos);
		this._plane.rayIntersect(this._newRay, worldPos);
		moveVector.setv(worldPos).subv(oldWorldPos);
		// And add to translation
		this.transform.translation.add(moveVector);
	};

	TranslationGizmo.prototype._moveOnLine = function() {
		var oldWorldPos = this._v0,
			worldPos = this._v1,
			moveVector = this._result,
			line = this._line;

		// Project mousemove to plane
		this._plane.rayIntersect(this._oldRay, oldWorldPos);
		this._plane.rayIntersect(this._newRay, worldPos);
		moveVector.setv(worldPos).subv(oldWorldPos);
		// Then project plane diff to line
		var d = moveVector.dot(line);
		moveVector.setv(line).muld(d,d,d);

		this.transform.translation.addv(moveVector);
	};

	TranslationGizmo.prototype._buildArrow = function(dim) {
		var arrowTransform = new Transform();
		var quadTransform = new Transform();

		if (dim === 2) {
			quadTransform.translation.setd(1, -1, 0);
		} else if(dim === 0) {
			quadTransform.translation.setd(0, -1, 1);
			quadTransform.setRotationXYZ(0, Math.PI/2, 0);
			arrowTransform.setRotationXYZ(0, Math.PI/2, 0);
		} else if (dim === 1) {
			quadTransform.translation.setd(1, 0, 1);
			quadTransform.setRotationXYZ(Math.PI/2, 0, 0);
			arrowTransform.setRotationXYZ(Math.PI/2, 0, 0);
		}

		this.renderables.push({
			meshData: this._arrowMesh,
			materials: [this._buildMaterialForAxis(dim)],
			transform: arrowTransform,
			id: Gizmo.registerHandle({ type: 'Axis', axis: dim })
		});

		this.renderables.push({
			meshData: this._quadMesh,
			materials: [this._buildMaterialForAxis(dim)],
			transform: quadTransform,
			id: Gizmo.registerHandle({ type: 'Plane', axis: dim })
		});
	};

	TranslationGizmo.prototype._buildArrowMesh = function() {
		var meshBuilder = new MeshBuilder();

		// Arrow head
		var mesh1Data = new Disk(32, 0.5, 2);
		// Arrow base
		var mesh2Data = new Disk(32, 0.5);
		// Line
		var mesh3Data = new MeshData(MeshData.defaultMap([MeshData.POSITION]), 2, 2);
		mesh3Data.getAttributeBuffer(MeshData.POSITION).set([0, 0, 0, 0, 0, 1]);
		mesh3Data.getIndexBuffer().set([0, 1]);
		mesh3Data.indexLengths = null;
		mesh3Data.indexModes = ['Lines'];

		// Arrow head
		var transform = new Transform();
		transform.translation.setd(0, 0, 10);
		transform.update();
		meshBuilder.addMeshData(mesh1Data, transform);

		// Arrow base
		transform.setRotationXYZ(0, Math.PI, 0);
		transform.update();
		meshBuilder.addMeshData(mesh2Data, transform);

		// Line
		var transform = new Transform();
		transform.scale.setd(1, 1, 10);
		transform.update();
		meshBuilder.addMeshData(mesh3Data, transform);

		// Combine
		var mergedMeshData = meshBuilder.build()[0];
		return mergedMeshData;
	};

	return TranslationGizmo;
});