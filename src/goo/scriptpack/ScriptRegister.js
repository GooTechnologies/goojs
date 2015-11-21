var Scripts = require('../scripts/Scripts');
var OrbitCamControlScript = require('../scripts/OrbitCamControlScript');
var OrbitNPanControlScript = require('../scriptpack/OrbitNPanControlScript');
var FlyControlScript = require('../scriptpack/FlyControlScript');
var AxisAlignedCamControlScript = require('../scriptpack/AxisAlignedCamControlScript');
var PanCamScript = require('../scriptpack/PanCamScript');
var MouseLookControlScript = require('../scriptpack/MouseLookControlScript');
var WasdControlScript = require('../scriptpack/WasdControlScript');
var ButtonScript = require('../scriptpack/ButtonScript');
var PickAndRotateScript = require('../scriptpack/PickAndRotateScript');
var LensFlareScript = require('../scriptpack/LensFlareScript');

	'use strict';

	for (var i = 1; i < arguments.length; i++) {
		Scripts.register(arguments[i]);
	}
});