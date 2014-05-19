define([
	'goo/scripts/Scripts',
	'goo/addons/waterpack/FlatWaterRenderer',
	'goo/addons/waterpack/ProjectedGridWaterRenderer'
], function (Scripts) {
	'use strict';

	var defines = [
		'goo/scripts/Scripts',
		'goo/addons/waterpack/FlatWaterRenderer',
		'goo/addons/waterpack/ProjectedGridWaterRenderer'
	];

	for (var i = 1; i < defines.length; i++) {
		var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
		Scripts.addClass(name, arguments[i]);
	}
});