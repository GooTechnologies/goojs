define([
	'goo/scripts/Scripts',
	'goo/util/gizmopack/Gizmo',
	'goo/util/gizmopack/GizmoRenderSystem',
	'goo/util/gizmopack/TranslationGizmo',
	'goo/util/gizmopack/RotationGizmo',
	'goo/util/gizmopack/ScaleGizmo'
], function (Scripts) {
	'use strict';

	var defines = [
		'goo/scripts/Scripts',
		'goo/util/gizmopack/Gizmo',
		'goo/util/gizmopack/GizmoRenderSystem',
		'goo/util/gizmopack/TranslationGizmo',
		'goo/util/gizmopack/RotationGizmo',
		'goo/util/gizmopack/ScaleGizmo'
	];

	for (var i = 1; i < defines.length; i++) {
		var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
		Scripts.addClass(name, arguments[i]);
	}
});