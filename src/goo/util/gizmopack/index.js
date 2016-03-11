module.exports = {
	Gizmo: require('./Gizmo'),
	GizmoRenderSystem: require('./GizmoRenderSystem'),
	GlobalRotationGizmo: require('./GlobalRotationGizmo'),
	GlobalTranslationGizmo: require('./GlobalTranslationGizmo'),
	RotationGizmo: require('./RotationGizmo'),
	ScaleGizmo: require('./ScaleGizmo'),
	TranslationGizmo: require('./TranslationGizmo')
};
if (typeof(window) !== 'undefined') {
	for (var key in module.exports) {
		window.goo[key] = module.exports[key];
	}
}