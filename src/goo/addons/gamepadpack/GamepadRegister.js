define([
	'goo/scripts/Scripts',
	'goo/addons/gamepadpack/GamepadComponent',
	'goo/addons/gamepadpack/GamepadSystem',
	'goo/addons/gamepadpack/GamepadData'
], function (Scripts) {
	'use strict';

	var defines = [
		'goo/scripts/Scripts',
		'goo/addons/gamepadpack/GamepadComponent',
		'goo/addons/gamepadpack/GamepadSystem',
		'goo/addons/gamepadpack/GamepadData'
	];

	for (var i = 1; i < defines.length; i++) {
		var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
		Scripts.addClass(name, arguments[i]);
	}
});