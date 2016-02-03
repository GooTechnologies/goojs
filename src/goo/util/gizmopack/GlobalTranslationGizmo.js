define([
	'goo/util/gizmopack/Gizmo',
	'goo/math/Vector3',
	'goo/util/gizmopack/TranslationGizmo'
], function (
	Gizmo,
	Vector3,
	TranslationGizmo
) {
	'use strict';

	/**
	 * @class
	 * @extends Gizmo
	 * @hidden
	 */
	function GlobalTranslationGizmo() {
		Gizmo.call(this, 'GlobalTranslationGizmo');

		this.realTranslation = new Vector3();
		this._snap = false;

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

	GlobalTranslationGizmo.prototype.setSnap = TranslationGizmo.prototype.setSnap;

	GlobalTranslationGizmo.prototype._addTranslation = TranslationGizmo.prototype._addTranslation;

	GlobalTranslationGizmo.prototype._moveOnPlane = TranslationGizmo.prototype._moveOnPlane;
	GlobalTranslationGizmo.prototype._moveOnLine = TranslationGizmo.prototype._moveOnLine;

	GlobalTranslationGizmo.prototype.compileRenderables = TranslationGizmo.prototype.compileRenderables;

	return GlobalTranslationGizmo;
});