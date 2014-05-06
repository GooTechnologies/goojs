define([
	'goo/scripts/Scripts',
	'goo/scripts/OrbitNPanControlScript',
	'goo/scripts/FlyControlScript',
	'goo/scripts/OrbitCamControlScript',
	'goo/scripts/AxisAlignedCamControlScript',
	'goo/scripts/PanCamScript',
	'goo/scripts/MouseLookScript',
	'goo/scripts/WASDScript',
	'goo/scripts/ButtonScript',
	'goo/scripts/PickAndRotateScript'
	//'goo/scripts/newwave/FPCamControlScript'
], function (Scripts) {
	'use strict';

	for (var i = 1; i < arguments.length; i++) {
		Scripts.register(arguments[i]);
	}
});