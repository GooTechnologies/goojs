define([
	'goo/scripts/Scripts',
	'goo/addons/terrainpack/Forrest',
	'goo/addons/terrainpack/Terrain',
	'goo/addons/terrainpack/TerrainHandler',
	'goo/addons/terrainpack/Vegetation'
], function (Scripts) {
	'use strict';

	var defines = [
		'goo/scripts/Scripts',
		'goo/addons/terrainpack/Forrest',
		'goo/addons/terrainpack/Terrain',
		'goo/addons/terrainpack/TerrainHandler',
		'goo/addons/terrainpack/Vegetation'
	];

	for (var i = 1; i < defines.length; i++) {
		var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
		Scripts.addClass(name, arguments[i]);
	}
});