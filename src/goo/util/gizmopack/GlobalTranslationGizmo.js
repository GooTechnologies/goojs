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

		this.compileRenderables();
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

	GlobalTranslationGizmo.prototype.compileRenderables = TranslationGizmo.prototype.compileRenderables;

	return GlobalTranslationGizmo;
});