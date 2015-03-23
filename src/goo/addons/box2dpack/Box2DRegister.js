define([
	'goo/scripts/Scripts',
	'goo/addons/box2dpack/systems/Box2DSystem',
	'goo/addons/box2dpack/components/Box2DComponent'
], function (Scripts) {
	'use strict';

	var defines = [
		'goo/scripts/Scripts',
		'goo/addons/box2dpack/systems/Box2DSystem',
		'goo/addons/box2dpack/components/Box2DComponent'
	];

	for (var i = 1; i < defines.length; i++) {
		var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
		Scripts.addClass(name, arguments[i]);
	}
});