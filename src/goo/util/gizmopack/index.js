import Gizmo from './Gizmo';
import GizmoRenderSystem from './GizmoRenderSystem';
import GlobalRotationGizmo from './GlobalRotationGizmo';
import GlobalTranslationGizmo from './GlobalTranslationGizmo';
import RotationGizmo from './RotationGizmo';
import ScaleGizmo from './ScaleGizmo';
import TranslationGizmo from './TranslationGizmo';

module.exports = {
	Gizmo,
	GizmoRenderSystem,
	GlobalRotationGizmo,
	GlobalTranslationGizmo,
	RotationGizmo,
	ScaleGizmo,
	TranslationGizmo
};

import ObjectUtils from './../ObjectUtils';

if (typeof(window) !== 'undefined') {
	ObjectUtils.extend(window.goo, module.exports);
}