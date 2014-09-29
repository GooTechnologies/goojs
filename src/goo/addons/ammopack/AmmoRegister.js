define([
	'goo/scripts/Scripts',
	'goo/addons/ammopack/AmmoSystem',
	'goo/addons/ammopack/AmmoComponent',
	'goo/addons/ammopack/calculateTriangleMeshShape'
], function (Scripts) {
	'use strict';

	var defines = [
		'goo/scripts/Scripts',
		'goo/addons/ammopack/AmmoSystem',
		'goo/addons/ammopack/AmmoComponent',
		'goo/addons/ammopack/calculateTriangleMeshShape'
	];

	for (var i = 1; i < defines.length; i++) {
		var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
		Scripts.addClass(name, arguments[i]);
	}
});