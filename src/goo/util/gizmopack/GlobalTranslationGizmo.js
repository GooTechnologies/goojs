define([
	'goo/util/gizmopack/Gizmo',
	'goo/util/gizmopack/TranslationGizmo',
	'goo/renderer/MeshData',
	'goo/util/MeshBuilder',
	'goo/shapes/Quad'
], function (
	Gizmo,
	TranslationGizmo,
	MeshData,
	MeshBuilder,
	Quad
) {
	'use strict';

	/**
	 * @extends Gizmo
	 * @hidden
	 */
	function GlobalTranslationGizmo() {
		Gizmo.call(this, 'GlobalTranslationGizmo');

		// Build geometry
		this._quadMesh = new Quad(2, 2);
		this._arrowMesh = this._buildArrowMesh();
		this._buildArrow(0);
		this._buildArrow(1);
		this._buildArrow(2);
	}

	GlobalTranslationGizmo.prototype = Object.create(Gizmo.prototype);
	GlobalTranslationGizmo.prototype.constructor = GlobalTranslationGizmo;

	GlobalTranslationGizmo.prototype.activate = TranslationGizmo.prototype.activate;
	GlobalTranslationGizmo.prototype.process = TranslationGizmo.prototype.process;

	GlobalTranslationGizmo.prototype.copyTransform = function (transform) {
		Gizmo.prototype.copyTransform.call(this, transform);

		this.transform.rotation.setIdentity();
		this.updateTransforms();
	};

	GlobalTranslationGizmo.prototype._moveOnPlane = TranslationGizmo.prototype._moveOnPlane;
	GlobalTranslationGizmo.prototype._moveOnLine = TranslationGizmo.prototype._moveOnLine;
	GlobalTranslationGizmo.prototype._buildArrow = TranslationGizmo.prototype._buildArrow;
	GlobalTranslationGizmo.prototype._buildArrowMesh = TranslationGizmo.prototype._buildArrowMesh;

	return GlobalTranslationGizmo;
});