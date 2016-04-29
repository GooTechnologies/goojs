module.exports = {
	AxisAlignedCamControlScript: require('./AxisAlignedCamControlScript'),
	BasicControlScript: require('./BasicControlScript'),
	ButtonScript: require('./ButtonScript'),
	CannonPickScript: require('./CannonPickScript'),
	FlyControlScript: require('./FlyControlScript'),
	GroundBoundMovementScript: require('./GroundBoundMovementScript'),
	HeightMapBoundingScript: require('./HeightMapBoundingScript'),
	LensFlareScript: require('./LensFlareScript'),
	MouseLookControlScript: require('./MouseLookControlScript'),
	OrbitNPanControlScript: require('./OrbitNPanControlScript'),
	PanCamScript: require('./PanCamScript'),
	PickAndRotateScript: require('./PickAndRotateScript'),
	PolyBoundingScript: require('./PolyBoundingScript'),
	RotationScript: require('./RotationScript'),
	ScriptComponentHandler: require('./ScriptComponentHandler'),
	ScriptHandler: require('./ScriptHandler'),
	ScriptHandlers: require('./ScriptHandlers'),
	ScriptRegister: require('./ScriptRegister'),
	SparseHeightMapBoundingScript: require('./SparseHeightMapBoundingScript'),
	VRControllerScript: require('./VRControllerScript'),
	WasdControlScript: require('./WasdControlScript'),
	WorldFittedTerrainScript: require('./WorldFittedTerrainScript')
};

if (typeof(window) !== 'undefined') {
	for (var key in module.exports) {
		window.goo[key] = module.exports[key];
	}
}