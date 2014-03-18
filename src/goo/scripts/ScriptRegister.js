define([
	'goo/scripts/Scripts',
	'goo/scripts/newwave/FlyControlScript',
	'goo/scripts/newwave/FPCamControlScript',
	'goo/scripts/newwave/MouseLookScript',
	'goo/scripts/newwave/OrbitCamControlScript',
	'goo/scripts/newwave/PanCamScript',
	'goo/scripts/newwave/OrbitNPanControlScript',
	'goo/scripts/newwave/PickAndRotateScript',
	'goo/scripts/newwave/RotationScript',
	'goo/scripts/newwave/WASDScript'
], function(Scripts) {
	'use strict';
	for (var i = 1; i < arguments.length; i++) {
		Scripts.register(arguments[i]);
	}
});