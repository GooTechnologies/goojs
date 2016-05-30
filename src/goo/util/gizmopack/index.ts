import Gizmo = require('./Gizmo');
import GizmoRenderSystem = require('./GizmoRenderSystem');
import GlobalRotationGizmo = require('./GlobalRotationGizmo');
import GlobalTranslationGizmo = require('./GlobalTranslationGizmo');
import RotationGizmo = require('./RotationGizmo');
import ScaleGizmo = require('./ScaleGizmo');
import TranslationGizmo = require('./TranslationGizmo');

var all = {
	Gizmo,
	GizmoRenderSystem,
	GlobalRotationGizmo,
	GlobalTranslationGizmo,
	RotationGizmo,
	ScaleGizmo,
	TranslationGizmo
}

export = all;

if (typeof(window) !== 'undefined') {
	for (var key in all) {
		(<any>window).goo[key] = all[key];
	}
}