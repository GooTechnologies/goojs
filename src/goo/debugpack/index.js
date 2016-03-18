import BoundingVolumeMeshBuilder from './BoundingVolumeMeshBuilder';
import MarkerComponent from './components/MarkerComponent';
import DebugDrawHelper from './DebugDrawHelper';
import Debugger from './Debugger';
import EntityCounter from './EntityCounter';
import index from './index';
import CameraDebug from './shapes/CameraDebug';
import LightDebug from './shapes/LightDebug';
import MeshRendererDebug from './shapes/MeshRendererDebug';
import SkeletonDebug from './shapes/SkeletonDebug';
import DebugRenderSystem from './systems/DebugRenderSystem';
import MarkerSystem from './systems/MarkerSystem';

module.exports = {
	BoundingVolumeMeshBuilder,
	MarkerComponent,
	DebugDrawHelper,
	Debugger,
	EntityCounter,
	index,
	CameraDebug,
	LightDebug,
	MeshRendererDebug,
	SkeletonDebug,
	DebugRenderSystem,
	MarkerSystem
};

import ObjectUtils from './../util/ObjectUtils';

if (typeof(window) !== 'undefined') {
	ObjectUtils.extend(window.goo, module.exports);
}