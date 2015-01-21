define([
	'goo/scripts/Scripts',
	'goo/geometrypack/FilledPolygon',
	'goo/geometrypack/PolyLine',
	'goo/geometrypack/RegularPolygon',
	'goo/geometrypack/Surface',
	'goo/geometrypack/Triangle'
], function (Scripts) {
	'use strict';

	var defines = [
		'goo/scripts/Scripts',
		'goo/geometrypack/FilledPolygon',
		'goo/geometrypack/PolyLine',
		'goo/geometrypack/RegularPolygon',
		'goo/geometrypack/Surface',
		'goo/geometrypack/Triangle'
	];

	for (var i = 1; i < defines.length; i++) {
		var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
		Scripts.addClass(name, arguments[i]);
	}
});