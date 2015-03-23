define([
	'goo/scripts/Scripts',
	'goo/passpack/BloomPass',
	'goo/passpack/BlurPass',
	'goo/passpack/DOFPass',
	'goo/passpack/DepthPass',
	'goo/passpack/DoGPass',
	'goo/passpack/MotionBlurPass',
	'goo/passpack/PassLib',
	'goo/passpack/SSAOPass'
], function (Scripts) {
	'use strict';

	var defines = [
		'goo/scripts/Scripts',
		'goo/passpack/BloomPass',
		'goo/passpack/BlurPass',
		'goo/passpack/DOFPass',
		'goo/passpack/DepthPass',
		'goo/passpack/DoGPass',
		'goo/passpack/MotionBlurPass',
		'goo/passpack/PassLib',
		'goo/passpack/SSAOPass'
	];

	for (var i = 1; i < defines.length; i++) {
		var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
		Scripts.addClass(name, arguments[i]);
	}
});