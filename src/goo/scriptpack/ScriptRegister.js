var Scripts = require('goo/scripts/Scripts');
var OrbitCamControlScript = require('goo/scripts/OrbitCamControlScript');
var OrbitNPanControlScript = require('goo/scriptpack/OrbitNPanControlScript');
var FlyControlScript = require('goo/scriptpack/FlyControlScript');
var AxisAlignedCamControlScript = require('goo/scriptpack/AxisAlignedCamControlScript');
var PanCamScript = require('goo/scriptpack/PanCamScript');
var MouseLookControlScript = require('goo/scriptpack/MouseLookControlScript');
var WasdControlScript = require('goo/scriptpack/WasdControlScript');
var ButtonScript = require('goo/scriptpack/ButtonScript');
var PickAndRotateScript = require('goo/scriptpack/PickAndRotateScript');
var LensFlareScript = require('goo/scriptpack/LensFlareScript');

	'use strict';

	for (var i = 1; i < arguments.length; i++) {
		Scripts.register(arguments[i]);
	}
});