define([
	'goo/scripts/Scripts',
	'goo/scripts/newwave/OrbitNPanControlScript',
	'goo/scripts/newwave/FlyControlScript',
	'goo/scripts/newwave/OrbitCamControlScript',
	'goo/scripts/newwave/AxisAlignedCamControlScript',
	'goo/scripts/newwave/PanCamScript',
	'goo/scripts/newwave/MouseLookScript',
	'goo/scripts/newwave/WASDScript',
	'goo/scripts/newwave/ButtonScript'
	//'goo/scripts/newwave/FPCamControlScript'
], function (Scripts) {
	'use strict';

	for (var i = 1; i < arguments.length; i++) {
		Scripts.register(arguments[i]);
	}
});