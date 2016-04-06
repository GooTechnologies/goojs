var Scripts = require('../scripts/Scripts');

var scripts = {
	OrbitCamControlScript: require('../scripts/OrbitCamControlScript'),
	OrbitNPanControlScript: require('./OrbitNPanControlScript'),
	FlyControlScript: require('./FlyControlScript'),
	AxisAlignedCamControlScript: require('./AxisAlignedCamControlScript'),
	PanCamScript: require('./PanCamScript'),
	MouseLookControlScript: require('./MouseLookControlScript'),
	WasdControlScript: require('./WasdControlScript'),
	ButtonScript: require('./ButtonScript'),
	PickAndRotateScript: require('./PickAndRotateScript'),
	LensFlareScript: require('./LensFlareScript')
};

for (var key in scripts) {
	Scripts.register(scripts[key]);
}
