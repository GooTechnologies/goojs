module.exports = {
	BoundingVolumeMeshBuilder: require('./BoundingVolumeMeshBuilder'),
	MarkerComponent: require('./components/MarkerComponent'),
	DebugDrawHelper: require('./DebugDrawHelper'),
	Debugger: require('./Debugger'),
	EntityCounter: require('./EntityCounter'),
	index: require('./index'),
	CameraDebug: require('./shapes/CameraDebug'),
	LightDebug: require('./shapes/LightDebug'),
	MeshRendererDebug: require('./shapes/MeshRendererDebug'),
	SkeletonDebug: require('./shapes/SkeletonDebug'),
	DebugRenderSystem: require('./systems/DebugRenderSystem'),
	MarkerSystem: require('./systems/MarkerSystem')
};
if (typeof(window) !== 'undefined') {
	for (var key in module.exports) {
		window.goo[key] = module.exports[key];
	}
}