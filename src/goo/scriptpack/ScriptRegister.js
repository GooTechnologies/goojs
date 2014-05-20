define([
	'goo/scripts/Scripts',
	'goo/scripts/OrbitCamControlScript',
	'goo/scriptpack/OrbitNPanControlScript',
	'goo/scriptpack/FlyControlScript',
	'goo/scriptpack/AxisAlignedCamControlScript',
	'goo/scriptpack/PanCamScript',
	'goo/scriptpack/MouseLookControlScript',
	'goo/scriptpack/WASDControlScript',
	'goo/scriptpack/ButtonScript',
	'goo/scriptpack/PickAndRotateScript',
	'goo/scriptpack/LensFlareScript'
	//'goo/scriptpack/PolyBoundingScript',
	//'goo/scriptpack/FPCamControlScript'
	//'goo/scriptpack/RotationScript'
	//'goo/scriptpack/BasicControlScript'
], function (Scripts) {
	'use strict';

	for (var i = 1; i < arguments.length; i++) {
		Scripts.register(arguments[i]);
		Scripts.addClass(arguments[i].name, arguments[i]);
	}
});